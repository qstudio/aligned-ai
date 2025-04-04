import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Trash2, Wand2, AlertCircle, ChevronDown, HelpCircle, Brain, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { analyzeDecisionContext, generateOptionsWithLLM, analyzeDecisionWithLLM } from "@/services/llmService";

type Option = {
  name: string;
  pros: string[];
  cons: string[];
};

type ContextData = {
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
};

const DecisionAnalyzer: React.FC = () => {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [extractedContext, setExtractedContext] = useState<ContextData>({
    importance: "medium",
    timeframe: "medium",
    confidence: 0.5
  });
  const [needsMoreContext, setNeedsMoreContext] = useState(false);
  const [manualImportance, setManualImportance] = useState<"low" | "medium" | "high">("medium");
  const [manualTimeframe, setManualTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [openOptionIndexes, setOpenOptionIndexes] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProsConsForOption, setShowProsConsForOption] = useState<number | null>(null);
  const [aiAgreesWithChoice, setAiAgreesWithChoice] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  
  const toggleOptionOpen = (index: number) => {
    if (openOptionIndexes.includes(index)) {
      setOpenOptionIndexes(openOptionIndexes.filter(i => i !== index));
    } else {
      setOpenOptionIndexes([...openOptionIndexes, index]);
    }
  };
  
  const processDecisionTitle = async () => {
    if (decisionTitle.trim().length > 5) {
      try {
        const contextAnalysis = await analyzeDecisionContext(decisionTitle);
        setExtractedContext({
          importance: contextAnalysis.importance,
          timeframe: contextAnalysis.timeframe,
          confidence: contextAnalysis.confidence
        });
        setNeedsMoreContext(contextAnalysis.confidence < 0.5);
        setManualImportance(contextAnalysis.importance);
        setManualTimeframe(contextAnalysis.timeframe);
        if (contextAnalysis.suggestedQuestions && contextAnalysis.suggestedQuestions.length > 0) {
          setSuggestedQuestions(contextAnalysis.suggestedQuestions);
          setShowSuggestions(true);
        } else {
          setSuggestedQuestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error analyzing decision:", error);
        toast({
          title: "Analysis error",
          description: "Could not analyze your decision context. Using default settings.",
          variant: "destructive"
        });
      }
    }
  };
  
  const generateOptions = async () => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title before generating options",
        variant: "destructive"
      });
      return;
    }
    await processDecisionTitle();
    setIsGenerating(true);
    setOptions([]);
    setOpenOptionIndexes([]);
    setShowOptions(true);
    setSelectedOptionIndex(null);
    setAnalysis(null);
    setAiAgreesWithChoice(null);
    try {
      const generatedOptions = await generateOptionsWithLLM(decisionTitle);
      // Ensure we have exactly two options
      const limitedOptions = generatedOptions.options.slice(0, 2);
      if (limitedOptions.length < 2) {
        // Add a second option if only one was generated
        limitedOptions.push({
          name: "Option B",
          pros: ["AI couldn't generate enough pros"],
          cons: ["AI couldn't generate enough cons"]
        });
      }
      setOptions(limitedOptions);
      setOpenOptionIndexes([0, 1]);
      toast({
        title: "Options generated",
        description: "AI has created options based on your decision"
      });
    } catch (error) {
      console.error("Error generating options:", error);
      toast({
        title: "Generation error",
        description: "Could not generate options. Please try again.",
        variant: "destructive"
      });
      // Fallback to basic options
      setOptions([{
        name: "Option A",
        pros: ["AI couldn't generate pros"],
        cons: ["AI couldn't generate cons"]
      }, {
        name: "Option B",
        pros: ["AI couldn't generate pros"],
        cons: ["AI couldn't generate cons"]
      }]);
      setOpenOptionIndexes([0, 1]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const selectOption = async (index: number) => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title",
        variant: "destructive"
      });
      return;
    }

    setSelectedOptionIndex(index);
    setShowProsConsForOption(index);
    setIsAnalyzing(true);
    setAnalysis(null);

    await processDecisionTitle();
    
    const finalContext = {
      importance: needsMoreContext ? manualImportance : extractedContext.importance,
      timeframe: needsMoreContext ? manualTimeframe : extractedContext.timeframe
    };
    
    try {
      const analysisResult = await analyzeDecisionWithLLM(decisionTitle, options, finalContext);
      setAnalysis(analysisResult);
      
      // Determine if AI agrees with choice
      // Simple heuristic: Check pros vs cons counts for each option
      const optionScores = options.map((option, idx) => {
        const validPros = option.pros.filter(p => p.trim()).length;
        const validCons = option.cons.filter(c => c.trim()).length;
        return {
          index: idx,
          score: validPros - validCons,
          name: option.name
        };
      });
      
      optionScores.sort((a, b) => b.score - a.score);
      const aiRecommendation = optionScores[0].index;
      setAiAgreesWithChoice(index === aiRecommendation);
      
      toast({
        title: "Selection made",
        description: `You chose: ${options[index].name}`
      });
    } catch (error) {
      console.error("Error analyzing decision:", error);
      toast({
        title: "Analysis error",
        description: "Could not analyze your decision. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input 
              id="decision" 
              placeholder="It's raining outside and I need to go and feed my sheep - should I go now or later?" 
              value={decisionTitle} 
              onChange={e => setDecisionTitle(e.target.value)} 
              className="flex-1" 
            />
            <Button 
              onClick={generateOptions} 
              variant="outline" 
              disabled={isGenerating || !decisionTitle.trim()} 
              className="flex items-center gap-1 whitespace-nowrap"
            >
              {isGenerating ? "Generating..." : (
                <>
                  <Wand2 className="h-4 w-4" /> Analyse
                </>
              )}
            </Button>
          </div>

          {showSuggestions && suggestedQuestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Need more clarity:</p>
                  <ul className="list-disc list-inside text-amber-700 space-y-1">
                    {suggestedQuestions.map((question, idx) => (
                      <li key={idx}>{question}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <Dialog open={needsMoreContext} onOpenChange={setNeedsMoreContext}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add more context to your decision</DialogTitle>
              <DialogDescription>
                This helps us provide more accurate analysis and recommendations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>How important is this decision?</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={manualImportance === "low" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualImportance("low")}
                  >
                    Low
                  </Button>
                  <Button 
                    variant={manualImportance === "medium" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualImportance("medium")}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={manualImportance === "high" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualImportance("high")}
                  >
                    High
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>What's the time frame?</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={manualTimeframe === "short" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualTimeframe("short")}
                  >
                    Short
                  </Button>
                  <Button 
                    variant={manualTimeframe === "medium" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualTimeframe("medium")}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={manualTimeframe === "long" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setManualTimeframe("long")}
                  >
                    Long
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button">Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showOptions && (
          <>
            <Separator className="my-2" />

            {isGenerating ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Generating options based on your decision...
              </div>
            ) : options.length > 0 ? (
              <div className="space-y-4">
                {/* Pro vs Con columns for side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((option, optionIndex) => (
                    <div key={optionIndex} className="rounded-lg border p-3">
                      <h3 className="font-medium text-sm mb-2">{option.name}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-green-600">Pros</Label>
                          <ScrollArea className="h-20 rounded border p-1">
                            {option.pros.map((pro, proIndex) => (
                              <div key={proIndex} className="flex items-center gap-1 py-1">
                                <div className="flex-1 text-xs flex items-center gap-1">
                                  <span className="text-green-600">+</span> {pro}
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-red-600">Cons</Label>
                          <ScrollArea className="h-20 rounded border p-1">
                            {option.cons.map((con, conIndex) => (
                              <div key={conIndex} className="flex items-center gap-1 py-1">
                                <div className="flex-1 text-xs flex items-center gap-1">
                                  <span className="text-red-600">-</span> {con}
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selection buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => selectOption(index)}
                      disabled={isAnalyzing}
                      variant="outline"
                      className={`flex items-center justify-center h-auto py-3 px-4 text-center ${selectedOptionIndex === index ? 'border-2 border-decision-purple' : ''}`}
                    >
                      {option.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Click the "Analyse" button to automatically create options based on your decision.
              </div>
            )}
            
            {selectedOptionIndex !== null && analysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }} 
                className="rounded-lg border p-3"
              >
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  You selected: {options[selectedOptionIndex].name}
                  {aiAgreesWithChoice !== null && (
                    aiAgreesWithChoice ? (
                      <span className="flex items-center text-green-600">
                        <ThumbsUp className="h-4 w-4 mr-1" /> AI agrees
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600">
                        <ThumbsDown className="h-4 w-4 mr-1" /> AI recommends the other option
                      </span>
                    )
                  )}
                </h3>
                
                {showProsConsForOption !== null && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-md p-2 mb-3"
                  >
                    <h4 className="font-medium text-sm mb-1">{options[showProsConsForOption].name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-1">Pros</h5>
                        <ul className="list-inside space-y-0.5">
                          {options[showProsConsForOption].pros
                            .filter(pro => pro.trim())
                            .map((pro, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-600 mr-1">+</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-1">Cons</h5>
                        <ul className="list-inside space-y-0.5">
                          {options[showProsConsForOption].cons
                            .filter(con => con.trim())
                            .map((con, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-red-600 mr-1">-</span>
                                <span>{con}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-xs max-h-32 overflow-y-auto whitespace-pre-line bg-gray-50 p-2 rounded">
                  {analysis}
                </div>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DecisionAnalyzer;

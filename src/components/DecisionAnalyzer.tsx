
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [isQuestionValid, setIsQuestionValid] = useState(true);
  const [needsClarification, setNeedsClarification] = useState(false);
  
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
        
        // Check if the decision is understood
        if (!contextAnalysis.understood) {
          setNeedsClarification(true);
          setIsQuestionValid(false);
          toast({
            title: "Question needs clarification",
            description: "Please provide more details about your decision",
            variant: "destructive"
          });
          return false;
        }
        
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
        
        // If there's a better phrasing suggestion
        if (contextAnalysis.betterPhrasing) {
          toast({
            title: "Suggestion",
            description: `Consider rephrasing: "${contextAnalysis.betterPhrasing}"`,
            variant: "default"
          });
        }
        
        setIsQuestionValid(true);
        return true;
      } catch (error) {
        console.error("Error analyzing decision:", error);
        toast({
          title: "Analysis error",
          description: "Could not analyze your decision context. Using default settings.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      toast({
        title: "Input too short",
        description: "Please enter a more detailed decision question",
        variant: "destructive"
      });
      return false;
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
    
    // Validate and process the decision title
    const isValid = await processDecisionTitle();
    if (!isValid) {
      return;
    }
    
    setIsGenerating(true);
    setOptions([]);
    setOpenOptionIndexes([]);
    setShowOptions(true);
    setSelectedOptionIndex(null);
    setAnalysis(null);
    setAiAgreesWithChoice(null);
    
    try {
      const generatedOptions = await generateOptionsWithLLM(decisionTitle);
      
      if (!generatedOptions.options || generatedOptions.options.length === 0) {
        toast({
          title: "Cannot generate options",
          description: "Please clarify your decision question with more details",
          variant: "destructive"
        });
        setNeedsClarification(true);
        setIsQuestionValid(false);
        return;
      }
      
      // Set options and open them
      setOptions(generatedOptions.options);
      setOpenOptionIndexes(Array.from({ length: generatedOptions.options.length }, (_, i) => i));
      
      toast({
        title: "Options generated",
        description: "AI has created options based on your decision"
      });
      
      setIsQuestionValid(true);
    } catch (error) {
      console.error("Error generating options:", error);
      toast({
        title: "Generation error",
        description: "Could not generate options. Please try again or clarify your question.",
        variant: "destructive"
      });
      setIsQuestionValid(false);
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

    // Re-validate the question
    const isValid = await processDecisionTitle();
    if (!isValid) {
      setIsAnalyzing(false);
      return;
    }
    
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
              className={`flex-1 ${!isQuestionValid ? 'border-red-400' : ''}`}
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
          
          {needsClarification && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Your question needs more details:</p>
                  <p className="text-red-700">Please clarify your decision by providing:</p>
                  <ul className="list-disc list-inside text-red-700 space-y-1 mt-1">
                    <li>What specific options are you considering?</li>
                    <li>What is the context of this decision?</li>
                    <li>What are your goals or constraints?</li>
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
                {/* Hide pros/cons columns until a decision is made */}
                {selectedOptionIndex === null && (
                  <div className="grid grid-cols-2 gap-3">
                    {options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => selectOption(index)}
                        disabled={isAnalyzing}
                        variant="outline"
                        className="flex items-center justify-center h-auto py-3 px-4 text-center"
                      >
                        {option.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Click the "Analyse" button to automatically create options based on your decision.
              </div>
            )}
            
            {selectedOptionIndex !== null && (
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

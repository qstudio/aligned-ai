import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Trash2, Wand2, AlertCircle, ChevronDown, HelpCircle, Brain, ArrowRight, ThumbsUp, ThumbsDown, Star, ChevronUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [recommendedOptionIndex, setRecommendedOptionIndex] = useState<number | null>(null);
  const [isAnalysingContext, setIsAnalysingContext] = useState(false);
  
  const toggleOptionOpen = (index: number) => {
    if (openOptionIndexes.includes(index)) {
      setOpenOptionIndexes(openOptionIndexes.filter(i => i !== index));
    } else {
      setOpenOptionIndexes([...openOptionIndexes, index]);
    }
  };
  
  const processDecisionTitle = async () => {
    if (decisionTitle.trim().length > 5) {
      setIsAnalysingContext(true);
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
          setIsAnalysingContext(false);
          return {
            isValid: false,
            needsClarification: true
          };
        }
        
        setNeedsMoreContext(contextAnalysis.confidence < 0.5);
        setManualImportance(contextAnalysis.importance);
        setManualTimeframe(contextAnalysis.timeframe);
        
        if (contextAnalysis.suggestedQuestions && contextAnalysis.suggestedQuestions.length > 0) {
          setSuggestedQuestions(contextAnalysis.suggestedQuestions);
          setShowSuggestions(true);
          setNeedsClarification(true);
          setIsQuestionValid(false);
          setIsAnalysingContext(false);
          return {
            isValid: false,
            needsClarification: true
          };
        } else {
          setSuggestedQuestions([]);
          setShowSuggestions(false);
        }
        
        // If there's a better phrasing suggestion
        if (contextAnalysis.betterPhrasing) {
          // Note: Toast removed as requested
        }
        
        setIsQuestionValid(true);
        setNeedsClarification(false);
        setIsAnalysingContext(false);
        return {
          isValid: true,
          needsClarification: false
        };
      } catch (error) {
        console.error("Error analyzing decision:", error);
        setIsAnalysingContext(false);
        return {
          isValid: false,
          needsClarification: false
        };
      }
    } else {
      return {
        isValid: false,
        needsClarification: false
      };
    }
  };
  
  const generateOptions = async () => {
    if (!decisionTitle.trim()) {
      return;
    }
    
    // Validate and process the decision title
    const validationResult = await processDecisionTitle();
    if (!validationResult.isValid) {
      return;
    }
    
    setIsGenerating(true);
    setOptions([]);
    setOpenOptionIndexes([]);
    setShowOptions(true);
    setSelectedOptionIndex(null);
    setAnalysis(null);
    setAiAgreesWithChoice(null);
    setShowAllOptions(false);
    setRecommendedOptionIndex(null);
    
    try {
      const generatedOptions = await generateOptionsWithLLM(decisionTitle);
      
      if (!generatedOptions.options || generatedOptions.options.length === 0) {
        setNeedsClarification(true);
        setIsQuestionValid(false);
        setShowOptions(false);
        return;
      }
      
      // Set options and open them
      setOptions(generatedOptions.options);
      setOpenOptionIndexes(Array.from({ length: generatedOptions.options.length }, (_, i) => i));
      
      setIsQuestionValid(true);
    } catch (error) {
      console.error("Error generating options:", error);
      setIsQuestionValid(false);
      setShowOptions(false);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const selectOption = async (index: number) => {
    if (!decisionTitle.trim()) {
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
      setRecommendedOptionIndex(aiRecommendation);
      setAiAgreesWithChoice(index === aiRecommendation);
    } catch (error) {
      console.error("Error analyzing decision:", error);
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
              disabled={isGenerating || isAnalysingContext || !decisionTitle.trim()} 
              className="flex items-center gap-1 whitespace-nowrap"
            >
              {isGenerating || isAnalysingContext ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  {isGenerating ? "Generating..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Analyse
                </>
              )}
            </Button>
          </div>

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
                  {showSuggestions && suggestedQuestions.length > 0 && (
                    <>
                      <p className="font-medium text-red-800 mt-2">Consider answering:</p>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {suggestedQuestions.map((question, idx) => (
                          <li key={idx}>{question}</li>
                        ))}
                      </ul>
                    </>
                  )}
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

        {showOptions && !needsClarification && (
          <>
            <Separator className="my-2" />

            {isGenerating ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Generating options based on your decision...
              </div>
            ) : options.length > 0 ? (
              <div className="space-y-4">
                {/* Display options grid - limited to top 2 initially */}
                <div className="grid grid-cols-2 gap-3">
                  {options
                    .map((option, index) => ({ option, index }))
                    .sort((a, b) => {
                      const aProsConsRatio = a.option.pros.length - a.option.cons.length;
                      const bProsConsRatio = b.option.pros.length - b.option.cons.length;
                      return bProsConsRatio - aProsConsRatio;
                    })
                    .slice(0, showAllOptions ? options.length : Math.min(2, options.length))
                    .map(({ option, index }) => (
                      <Button
                        key={index}
                        onClick={() => selectOption(index)}
                        disabled={isAnalyzing}
                        variant={selectedOptionIndex === index ? "default" : "outline"}
                        className={`flex items-center justify-center h-auto py-3 px-4 text-center relative ${
                          selectedOptionIndex === index ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        {option.name}
                        {recommendedOptionIndex === index && selectedOptionIndex !== index && (
                          <div className="absolute -top-2 -right-2">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          </div>
                        )}
                      </Button>
                    ))}
                </div>
                
                {/* Show more options button */}
                {options.length > 2 && (
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAllOptions(!showAllOptions)}
                      className="text-xs flex items-center gap-1"
                    >
                      {showAllOptions ? (
                        <>Show fewer options <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Show more options ({options.length - 2} more) <ChevronDown className="h-3 w-3" /></>
                      )}
                    </Button>
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
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                      Analyzing your selection...
                    </div>
                  ) : (
                    analysis
                  )}
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

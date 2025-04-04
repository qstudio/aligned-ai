
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { DecisionInput } from "./DecisionInput";
import { ContextDialog } from "./ContextDialog";
import { OptionsList } from "./OptionsList";
import { OptionDetail } from "./OptionDetail";
import { Option, ContextData } from "./types";
import { 
  analyzeDecisionContext, 
  generateOptionsWithLLM, 
  analyzeDecisionWithLLM 
} from "@/services/llmService";

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
  
  // Reset feedback when the question changes
  useEffect(() => {
    if (decisionTitle) {
      // Reset validation states when user is typing a new question
      setNeedsClarification(false);
      setIsQuestionValid(true);
      setShowSuggestions(false);
    }
  }, [decisionTitle]);
  
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
    if (!validationResult?.isValid) {
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
        <DecisionInput
          decisionTitle={decisionTitle}
          setDecisionTitle={setDecisionTitle}
          generateOptions={generateOptions}
          isGenerating={isGenerating}
          isAnalysingContext={isAnalysingContext}
          needsClarification={needsClarification}
          isQuestionValid={isQuestionValid}
          suggestedQuestions={suggestedQuestions}
          showSuggestions={showSuggestions}
        />

        <ContextDialog
          open={needsMoreContext}
          setOpen={setNeedsMoreContext}
          manualImportance={manualImportance}
          setManualImportance={setManualImportance}
          manualTimeframe={manualTimeframe}
          setManualTimeframe={setManualTimeframe}
        />

        {showOptions && !needsClarification && (
          <>
            <Separator className="my-2" />

            {isGenerating ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Generating options based on your decision...
              </div>
            ) : (
              <OptionsList
                options={options}
                showAllOptions={showAllOptions}
                setShowAllOptions={setShowAllOptions}
                selectedOptionIndex={selectedOptionIndex}
                recommendedOptionIndex={recommendedOptionIndex}
                selectOption={selectOption}
                isAnalyzing={isAnalyzing}
              />
            )}
            
            {selectedOptionIndex !== null && options[selectedOptionIndex] && (
              <OptionDetail
                selectedOption={options[selectedOptionIndex]}
                selectedOptionIndex={selectedOptionIndex}
                aiAgreesWithChoice={aiAgreesWithChoice}
                showProsConsForOption={showProsConsForOption}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DecisionAnalyzer;

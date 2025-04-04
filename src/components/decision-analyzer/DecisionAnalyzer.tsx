
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
import { toast } from "sonner";
import { FacebookProfileInput } from "../social-media/FacebookProfileInput";
import { FacebookProfileData } from "@/services/facebook/profileExtractor";

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
  const [betterPhrasing, setBetterPhrasing] = useState<string | undefined>(undefined);
  
  // New state for FB profile integration
  const [profileData, setProfileData] = useState<FacebookProfileData | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [experimentMode, setExperimentMode] = useState<"enabled" | "disabled" | "a-b">("disabled");
  
  // Load experiment mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("fb_experiment_mode");
    if (savedMode && ["enabled", "disabled", "a-b"].includes(savedMode)) {
      setExperimentMode(savedMode as "enabled" | "disabled" | "a-b");
    }
  }, []);
  
  // Save experiment mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("fb_experiment_mode", experimentMode);
  }, [experimentMode]);
  
  // Toggle profile settings visibility
  const toggleProfileSettings = () => {
    setShowProfileSettings(!showProfileSettings);
  };
  
  // Handle profile data changes from the FacebookProfileInput component
  const handleProfileDataChange = (newProfileData: FacebookProfileData | null) => {
    setProfileData(newProfileData);
    
    if (newProfileData && !newProfileData.interests?.length) {
      // If profile data was cleared or is empty
      toast.info("Profile data has been cleared");
    } else if (newProfileData) {
      toast.success("Profile data updated", {
        description: `Using ${newProfileData.interests.length} interests to enhance your decisions`,
      });
    }
  };
  
  useEffect(() => {
    if (decisionTitle) {
      setNeedsClarification(false);
      setIsQuestionValid(true);
      setShowSuggestions(false);
      setBetterPhrasing(undefined);
    }
  }, [decisionTitle]);
  
  const toggleOptionOpen = (index: number) => {
    if (openOptionIndexes.includes(index)) {
      setOpenOptionIndexes(openOptionIndexes.filter(i => i !== index));
    } else {
      setOpenOptionIndexes([...openOptionIndexes, index]);
    }
  };
  
  // Determine if profile data should be used for current operation
  const shouldUseProfileData = () => {
    if (experimentMode === "disabled") return false;
    if (experimentMode === "enabled") return !!profileData;
    
    // For A/B mode, alternate between runs
    const useProfile = Math.random() >= 0.5;
    console.log(`A/B testing mode: ${useProfile ? "USING" : "NOT USING"} profile data this time`);
    return useProfile && !!profileData;
  };
  
  const processDecisionTitle = async () => {
    if (decisionTitle.trim().length > 5) {
      setIsAnalysingContext(true);
      try {
        // Determine if we should use profile data
        const useProfileData = shouldUseProfileData();
        console.log("Using profile data:", useProfileData);
        
        const contextAnalysis = await analyzeDecisionContext(
          decisionTitle, 
          useProfileData ? profileData : null
        );
        
        setExtractedContext({
          importance: contextAnalysis.importance,
          timeframe: contextAnalysis.timeframe,
          confidence: contextAnalysis.confidence
        });
        
        if (contextAnalysis.betterPhrasing && contextAnalysis.betterPhrasing !== decisionTitle) {
          setBetterPhrasing(contextAnalysis.betterPhrasing);
        } else {
          setBetterPhrasing(undefined);
        }
        
        if (!contextAnalysis.understood) {
          setNeedsClarification(true);
          setIsQuestionValid(false);
          setIsAnalysingContext(false);
          return {
            isValid: false,
            needsClarification: true
          };
        }
        
        const lowConfidence = contextAnalysis.confidence < 0.3;
        setNeedsMoreContext(lowConfidence);
        setManualImportance(contextAnalysis.importance);
        setManualTimeframe(contextAnalysis.timeframe);
        
        if (contextAnalysis.suggestedQuestions && contextAnalysis.suggestedQuestions.length > 0) {
          setSuggestedQuestions(contextAnalysis.suggestedQuestions);
          setShowSuggestions(true);
          
          if (lowConfidence) {
            setNeedsClarification(true);
            setIsQuestionValid(false);
            setIsAnalysingContext(false);
            return {
              isValid: false,
              needsClarification: true
            };
          }
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
        toast.error("Error analyzing your decision. Please try again.");
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
      // Determine if we should use profile data
      const useProfileData = shouldUseProfileData();
      console.log("Generating options with profile data:", useProfileData);
      
      const generatedOptions = await generateOptionsWithLLM(
        decisionTitle, 
        useProfileData ? profileData : null
      );
      
      if (!generatedOptions.options || generatedOptions.options.length === 0) {
        setNeedsClarification(true);
        setIsQuestionValid(false);
        setShowOptions(false);
        toast.error("Couldn't generate options. Please provide more details about your question.");
        return;
      }
      
      setOptions(generatedOptions.options);
      setOpenOptionIndexes(Array.from({ length: generatedOptions.options.length }, (_, i) => i));
      
      setIsQuestionValid(true);
      toast.success(`Generated ${generatedOptions.options.length} options for your question`, {
        description: useProfileData && profileData ? 
          "Enhanced with your profile information" : undefined
      });
    } catch (error) {
      console.error("Error generating options:", error);
      setIsQuestionValid(false);
      setShowOptions(false);
      toast.error("Error generating options. Please try again.");
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
      // Determine if we should use profile data
      const useProfileData = shouldUseProfileData();
      console.log("Analyzing decision with profile data:", useProfileData);
      
      const analysisResult = await analyzeDecisionWithLLM(
        decisionTitle, 
        options, 
        finalContext,
        useProfileData ? profileData : null
      );
      
      setAnalysis(analysisResult);
      
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
      toast.error("Error analyzing your choice. Please try again.");
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
          betterPhrasing={betterPhrasing}
          toggleProfileSettings={toggleProfileSettings}
          experimentMode={experimentMode}
          setExperimentMode={setExperimentMode}
        />
        
        {showProfileSettings && (
          <div className="mt-4">
            <FacebookProfileInput onProfileDataChange={handleProfileDataChange} />
          </div>
        )}

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
                Generating options based on your question...
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

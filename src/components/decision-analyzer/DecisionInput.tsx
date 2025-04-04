
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContextDialog } from "./ContextDialog";
import { DecisionInputField } from "./DecisionInputField";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ContextIndicators } from "./ContextIndicators";
import { ExperimentModeSelector } from "./ExperimentModeSelector";
import { FacebookProfileInput } from "../social-media/FacebookProfileInput";

interface DecisionInputProps {
  decisionTitle: string;
  setDecisionTitle: (title: string) => void;
  suggestedQuestions: string[];
  betterPhrasing?: string;
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  onAnalyze: () => void;
  profileUrl: string;
  setProfileUrl: (url: string) => void;
  experimentMode: "enabled" | "disabled" | "a-b";
  setExperimentMode: (mode: "enabled" | "disabled" | "a-b") => void;
}

export const DecisionInput: React.FC<DecisionInputProps> = ({
  decisionTitle,
  setDecisionTitle,
  suggestedQuestions,
  betterPhrasing,
  importance,
  timeframe,
  confidence,
  onAnalyze,
  profileUrl,
  setProfileUrl,
  experimentMode,
  setExperimentMode
}) => {
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [manualImportance, setManualImportance] = useState<"low" | "medium" | "high">(importance);
  const [manualTimeframe, setManualTimeframe] = useState<"short" | "medium" | "long">(timeframe);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3 space-y-3">
          <DecisionInputField 
            decisionTitle={decisionTitle}
            setDecisionTitle={setDecisionTitle}
            betterPhrasing={betterPhrasing}
            onAnalyze={onAnalyze}
          />
          
          <SuggestedQuestions 
            suggestedQuestions={suggestedQuestions}
            setDecisionTitle={setDecisionTitle}
            onAnalyze={onAnalyze}
          />
          
          {(importance || timeframe) && (
            <>
              <Separator />
              <ContextIndicators 
                importance={manualImportance} 
                timeframe={manualTimeframe} 
                confidence={confidence}
                onOpenContextDialog={() => setContextDialogOpen(true)}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3">
          <ExperimentModeSelector 
            experimentMode={experimentMode}
            setExperimentMode={setExperimentMode}
          />
          
          {experimentMode !== "disabled" && (
            <FacebookProfileInput 
              profileUrl={profileUrl}
              setProfileUrl={setProfileUrl}
            />
          )}
        </CardContent>
      </Card>
      
      <ContextDialog 
        open={contextDialogOpen} 
        setOpen={setContextDialogOpen}
        manualImportance={manualImportance}
        setManualImportance={setManualImportance}
        manualTimeframe={manualTimeframe}
        setManualTimeframe={setManualTimeframe}
      />
    </div>
  );
};

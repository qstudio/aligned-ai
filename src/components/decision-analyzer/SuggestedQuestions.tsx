
import React from "react";
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  suggestedQuestions: string[];
  setDecisionTitle: (title: string) => void;
  onAnalyze: () => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  suggestedQuestions,
  setDecisionTitle,
  onAnalyze
}) => {
  const handleQuestionClick = (question: string) => {
    setDecisionTitle(question);
    onAnalyze();
  };

  if (!suggestedQuestions.length) return null;

  return (
    <div className="mt-2">
      <div className="text-xs text-muted-foreground mb-1">Suggested questions:</div>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question, idx) => (
          <Button 
            key={idx} 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => handleQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};

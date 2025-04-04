
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { placeholders } from "./utils/placeholders";

interface DecisionInputFieldProps {
  decisionTitle: string;
  setDecisionTitle: (title: string) => void;
  betterPhrasing: string | undefined;
  onAnalyze: () => void;
}

export const DecisionInputField: React.FC<DecisionInputFieldProps> = ({
  decisionTitle,
  setDecisionTitle,
  betterPhrasing,
  onAnalyze
}) => {
  // State to track the current placeholder
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  
  // Set a random placeholder when the component mounts
  useEffect(() => {
    setCurrentPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
  }, []);
  
  const useBetterPhrasing = () => {
    if (betterPhrasing) {
      setDecisionTitle(betterPhrasing);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAnalyze();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input 
          id="decision" 
          placeholder={currentPlaceholder}
          value={decisionTitle} 
          onChange={e => setDecisionTitle(e.target.value)} 
          onKeyDown={handleKeyDown}
        />
        <Button 
          onClick={onAnalyze}
          disabled={!decisionTitle.trim()}
        >
          Analyze
        </Button>
      </div>
      
      {betterPhrasing && betterPhrasing !== decisionTitle && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Did you mean:</span>
          <Button 
            variant="link" 
            className="h-auto p-0 text-sm"
            onClick={useBetterPhrasing}
          >
            {betterPhrasing}
          </Button>
        </div>
      )}
    </div>
  );
};

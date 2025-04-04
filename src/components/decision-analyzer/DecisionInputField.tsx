
import React, { useEffect, useState, useCallback } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const [hasUserInput, setHasUserInput] = useState(false);
  
  // Set a random placeholder when the component mounts
  useEffect(() => {
    setCurrentPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
  }, []);
  
  const useBetterPhrasing = () => {
    if (betterPhrasing) {
      setDecisionTitle(betterPhrasing);
      setHasUserInput(true);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAnalyze();
    }
  };

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Only clear the input if the user hasn't entered any text
    if (!hasUserInput && decisionTitle === currentPlaceholder) {
      setDecisionTitle('');
    }
  }, [hasUserInput, decisionTitle, currentPlaceholder, setDecisionTitle]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // If user didn't enter any text, show the placeholder again
    if (!decisionTitle.trim()) {
      setDecisionTitle(currentPlaceholder);
      setHasUserInput(false);
    }
  }, [decisionTitle, currentPlaceholder, setDecisionTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecisionTitle(e.target.value);
    if (e.target.value.trim() !== '' && e.target.value !== currentPlaceholder) {
      setHasUserInput(true);
    } else if (e.target.value.trim() === '') {
      setHasUserInput(false);
    }
  };

  // Initialize with placeholder text when component mounts
  useEffect(() => {
    if (!decisionTitle && !hasUserInput && currentPlaceholder) {
      setDecisionTitle(currentPlaceholder);
    }
  }, [currentPlaceholder, decisionTitle, hasUserInput, setDecisionTitle]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input 
          id="decision" 
          value={decisionTitle} 
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={!hasUserInput && !isFocused ? "text-muted-foreground" : ""}
        />
        <Button 
          onClick={onAnalyze}
          disabled={!decisionTitle.trim() || (!hasUserInput && decisionTitle === currentPlaceholder)}
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

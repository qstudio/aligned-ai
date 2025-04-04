
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, AlertCircle } from "lucide-react";

interface DecisionInputProps {
  decisionTitle: string;
  setDecisionTitle: (title: string) => void;
  generateOptions: () => void;
  isGenerating: boolean;
  isAnalysingContext: boolean;
  needsClarification: boolean;
  isQuestionValid: boolean;
  suggestedQuestions: string[];
  showSuggestions: boolean;
}

export const DecisionInput: React.FC<DecisionInputProps> = ({
  decisionTitle,
  setDecisionTitle,
  generateOptions,
  isGenerating,
  isAnalysingContext,
  needsClarification,
  isQuestionValid,
  suggestedQuestions,
  showSuggestions,
}) => {
  return (
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
  );
};

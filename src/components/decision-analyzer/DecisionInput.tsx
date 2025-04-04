
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings, Brain, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  betterPhrasing?: string;
  toggleProfileSettings: () => void;
  experimentMode: "enabled" | "disabled" | "a-b";
  setExperimentMode: (mode: "enabled" | "disabled" | "a-b") => void;
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
  betterPhrasing,
  toggleProfileSettings,
  experimentMode,
  setExperimentMode
}) => {
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isGenerating && decisionTitle.length > 5) {
      generateOptions();
    }
  };

  const handleSuggestionClick = (question: string) => {
    setDecisionTitle(question);
  };

  const handleBetterPhrasing = () => {
    if (betterPhrasing) {
      setDecisionTitle(betterPhrasing);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Brain className="h-5 w-5 text-primary/80" />
        <h3 className="text-lg font-medium">Decision Analyzer</h3>
        
        <div className="flex-1"></div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Settings</h4>
              <Separator />
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Facebook Integration</h5>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleProfileSettings} 
                  className="w-full"
                >
                  Manage Profile Settings
                </Button>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Integration Mode</h5>
                <RadioGroup 
                  defaultValue={experimentMode}
                  onValueChange={(value) => setExperimentMode(value as "enabled" | "disabled" | "a-b")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id="r1" />
                    <Label htmlFor="r1">Disabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enabled" id="r2" />
                    <Label htmlFor="r2">Enabled (When Profile Available)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="a-b" id="r3" />
                    <Label htmlFor="r3">A/B Testing Mode (Random)</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">
                  A/B testing mode randomly decides whether to use profile data for each decision.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Input
            className={`text-base pr-10 ${!isQuestionValid ? "border-red-400" : ""}`}
            placeholder="What decision are you trying to make?"
            value={decisionTitle}
            onChange={(e) => setDecisionTitle(e.target.value)}
            onKeyPress={handleInputKeyPress}
          />
          {isAnalysingContext && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {needsClarification && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Please clarify your question</p>
              <p className="text-red-600">
                I need more context to understand your decision. Try to phrase it as a clear choice or question.
              </p>
            </div>
          </div>
        )}

        {betterPhrasing && isQuestionValid && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">
                <span className="font-medium">Suggested rephrasing:</span> {betterPhrasing}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleBetterPhrasing}
              >
                Use This
              </Button>
            </div>
          </div>
        )}

        {showSuggestions && suggestedQuestions.length > 0 && (
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 text-xs py-0"
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full"
        onClick={generateOptions}
        disabled={isGenerating || decisionTitle.length <= 5}
      >
        {isGenerating ? "Analyzing..." : "Analyze Decision"}
      </Button>
    </div>
  );
};

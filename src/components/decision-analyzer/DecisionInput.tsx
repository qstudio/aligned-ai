
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Wand2, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Facebook
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

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

// Array of random decision placeholders
const placeholders = [
  "Should I go for a walk or meet friends for a drink?",
  "Should I eat pasta or rice for dinner tonight?",
  "Should I take a vacation to the mountains or the beach?",
  "Should I buy a new laptop now or wait for next year's model?",
  "Should I learn guitar or piano as my new hobby?",
  "Should I watch a comedy or thriller movie tonight?",
  "Should I adopt a cat or a dog from the shelter?",
  "Should I apply for a new job or ask for a promotion?",
  "Should I make coffee at home or stop at a cafe on my way?"
];

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
  // State to track the current placeholder
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  
  // Set a random placeholder when the component mounts
  useEffect(() => {
    setCurrentPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
  }, []);
  
  const useBetterPhrasing = () => {
    if (betterPhrasing) {
      setDecisionTitle(betterPhrasing);
      toast.success("Using suggested phrasing");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && decisionTitle.trim() && !isGenerating && !isAnalysingContext) {
      e.preventDefault();
      generateOptions();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input 
          id="decision" 
          placeholder={currentPlaceholder}
          value={decisionTitle} 
          onChange={e => setDecisionTitle(e.target.value)} 
          onKeyDown={handleKeyDown}
          className={`flex-1 ${!isQuestionValid ? 'border-red-400' : ''}`}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="Profile settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Experiment Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={toggleProfileSettings}
                className="cursor-pointer"
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                <span>Facebook Profile Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Facebook Integration</DropdownMenuLabel>
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => setExperimentMode("disabled")}
                className={`cursor-pointer ${experimentMode === "disabled" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${experimentMode === "disabled" ? "bg-blue-600" : "border border-gray-400"}`}></div>
                  <span>Disabled (default)</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setExperimentMode("enabled")}
                className={`cursor-pointer ${experimentMode === "enabled" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${experimentMode === "enabled" ? "bg-blue-600" : "border border-gray-400"}`}></div>
                  <span>Always Enabled</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setExperimentMode("a-b")}
                className={`cursor-pointer ${experimentMode === "a-b" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${experimentMode === "a-b" ? "bg-blue-600" : "border border-gray-400"}`}></div>
                  <span>A/B Testing (random)</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
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

      {betterPhrasing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
          <div className="flex items-start gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm flex-1">
              <p className="font-medium text-blue-800">Suggested rephrasing:</p>
              <p className="text-blue-700">{betterPhrasing}</p>
              <Button 
                variant="link" 
                onClick={useBetterPhrasing} 
                className="p-0 h-auto text-xs text-blue-600"
              >
                Use this phrasing
              </Button>
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
      
      {experimentMode !== "disabled" && (
        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
          <Facebook className="h-3 w-3 text-blue-600" />
          {experimentMode === "enabled" ? (
            <span>Facebook profile integration is active</span>
          ) : (
            <span>Facebook profile A/B testing is active</span>
          )}
        </div>
      )}
    </div>
  );
};

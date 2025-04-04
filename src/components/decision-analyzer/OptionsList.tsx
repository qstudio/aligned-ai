
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { Option } from "./types";

interface OptionsListProps {
  options: Option[];
  showAllOptions: boolean;
  setShowAllOptions: (show: boolean) => void;
  selectedOptionIndex: number | null;
  recommendedOptionIndex: number | null;
  selectOption: (index: number) => void;
  isAnalyzing: boolean;
}

export const OptionsList: React.FC<OptionsListProps> = ({
  options,
  showAllOptions,
  setShowAllOptions,
  selectedOptionIndex,
  recommendedOptionIndex,
  selectOption,
  isAnalyzing
}) => {
  if (options.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Click the "Analyse" button to automatically create options based on your question.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Display options grid - limited to top 2 initially */}
      <div className="grid grid-cols-2 gap-3">
        {options
          .slice(0, showAllOptions ? options.length : Math.min(2, options.length))
          .map((option, index) => (
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
  );
};

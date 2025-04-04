
import React from "react";
import { PlusCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ContextIndicatorsProps {
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  onOpenContextDialog: () => void;
}

export const ContextIndicators: React.FC<ContextIndicatorsProps> = ({
  importance, 
  timeframe, 
  confidence,
  onOpenContextDialog
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-3 gap-x-2">
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">Importance</div>
          <div className="text-sm font-medium capitalize">{importance}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">Timeframe</div>
          <div className="text-sm font-medium capitalize">{timeframe}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <Slider 
            value={[confidence * 100]} 
            max={100} 
            step={1}
            disabled
            className="py-0 my-1.5"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 text-xs flex items-center gap-1"
          onClick={onOpenContextDialog}
        >
          <PlusCircle className="h-3 w-3" />
          Add context
        </Button>
      </div>
    </div>
  );
};

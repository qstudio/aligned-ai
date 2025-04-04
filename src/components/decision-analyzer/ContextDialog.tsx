
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";

interface ContextDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  manualImportance: "low" | "medium" | "high";
  setManualImportance: (importance: "low" | "medium" | "high") => void;
  manualTimeframe: "short" | "medium" | "long";
  setManualTimeframe: (timeframe: "short" | "medium" | "long") => void;
}

export const ContextDialog: React.FC<ContextDialogProps> = ({
  open,
  setOpen,
  manualImportance,
  setManualImportance,
  manualTimeframe,
  setManualTimeframe
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add more context to your decision</DialogTitle>
          <DialogDescription>
            This helps us provide more accurate analysis and recommendations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>How important is this decision?</Label>
            <div className="flex gap-2">
              <Button 
                variant={manualImportance === "low" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualImportance("low")}
              >
                Low
              </Button>
              <Button 
                variant={manualImportance === "medium" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualImportance("medium")}
              >
                Medium
              </Button>
              <Button 
                variant={manualImportance === "high" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualImportance("high")}
              >
                High
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>What's the time frame?</Label>
            <div className="flex gap-2">
              <Button 
                variant={manualTimeframe === "short" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualTimeframe("short")}
              >
                Short
              </Button>
              <Button 
                variant={manualTimeframe === "medium" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualTimeframe("medium")}
              >
                Medium
              </Button>
              <Button 
                variant={manualTimeframe === "long" ? "default" : "outline"} 
                className="flex-1" 
                onClick={() => setManualTimeframe("long")}
              >
                Long
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

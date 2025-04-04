
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExperimentModeSelectorProps {
  experimentMode: "enabled" | "disabled" | "a-b";
  setExperimentMode: (mode: "enabled" | "disabled" | "a-b") => void;
}

export const ExperimentModeSelector: React.FC<ExperimentModeSelectorProps> = ({
  experimentMode,
  setExperimentMode
}) => {
  return (
    <div className="mb-2">
      <Select value={experimentMode} onValueChange={(value) => setExperimentMode(value as "enabled" | "disabled" | "a-b")}>
        <SelectTrigger className="text-xs h-8">
          <SelectValue placeholder="AI Personalization" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="enabled">Facebook Profile Enabled</SelectItem>
          <SelectItem value="disabled">Facebook Profile Disabled</SelectItem>
          <SelectItem value="a-b">A/B Test</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

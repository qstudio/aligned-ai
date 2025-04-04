
import React from "react";
import DecisionAnalyzer from "./decision-analyzer/DecisionAnalyzer";
import { Toaster } from "@/components/ui/sonner";

// Re-exporting the component with the same name to maintain backward compatibility
const DecisionAnalyzerWrapper = () => (
  <>
    <Toaster />
    <DecisionAnalyzer />
  </>
);

export default DecisionAnalyzerWrapper;

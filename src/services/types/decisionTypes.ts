
// Context analysis response type
export interface ContextAnalysisResponse {
  understood: boolean;
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  suggestedQuestions: string[];
  betterPhrasing?: string;
}

// Option type
export interface Option {
  name: string;
  pros: string[];
  cons: string[];
}

// Options generation response
export interface OptionGenerationResponse {
  options: Option[];
}

// Add the missing DecisionDomainsMap interface
export interface DecisionDomainsMap {
  [key: string]: string;
}

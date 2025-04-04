
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

// DecisionDomain interface to match the structure in decisionDomains.ts
export interface DecisionDomain {
  context: string;
  examples: string[];
}

// Revised DecisionDomainsMap interface
export interface DecisionDomainsMap {
  [key: string]: DecisionDomain;
}

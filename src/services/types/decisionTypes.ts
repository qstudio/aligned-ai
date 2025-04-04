
// Types for context analysis responses from the LLM
export type ContextAnalysisResponse = {
  understood: boolean;
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  suggestedQuestions?: string[];
  betterPhrasing?: string;
};

// Types for option generation responses from the LLM
export type OptionGenerationResponse = {
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[];
  rationale?: string;
};

export type DecisionContext = {
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
};

export type DecisionDomain = {
  context: string;
  examples: string[];
};

export type DecisionDomainsMap = {
  [key: string]: DecisionDomain;
};

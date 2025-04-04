
// Types for decision domain knowledge base
export interface DecisionDomainInfo {
  context: string;
  examples: string[];
}

export interface DecisionDomainsMap {
  [key: string]: DecisionDomainInfo;
}

// Type for the response from context analysis
export interface ContextAnalysisResponse {
  understood: boolean;
  importance: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  confidence: number;
  suggestedQuestions?: string[];
  betterPhrasing?: string;
}

// Type for option generation response
export interface OptionGenerationResponse {
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[];
  rationale?: string;
}

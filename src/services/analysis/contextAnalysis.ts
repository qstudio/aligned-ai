
import { callPerplexityAPI } from '../api/perplexityService';
import { buildContextAnalysisPrompt } from '../prompts/decisionPrompts';
import { ContextAnalysisResponse } from '../types/decisionTypes';

// Analyze the decision context using Perplexity
export const analyzeDecisionContext = async (
  decisionTitle: string
): Promise<ContextAnalysisResponse> => {
  try {
    const systemPrompt = buildContextAnalysisPrompt();
    const userPrompt = `Analyze this decision question: "${decisionTitle}"`;

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    
    // Parse the JSON response
    let parsed: ContextAnalysisResponse;
    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error("Failed to parse Perplexity response:", error);
      console.log("Raw response:", result);
      
      // Fallback to default values if parsing fails
      return {
        understood: true,
        importance: "medium",
        timeframe: "medium",
        confidence: 0.5,
        suggestedQuestions: ["Could you provide more context about your decision?"]
      };
    }
    
    // Ensure all required properties are present
    return {
      understood: parsed.understood ?? true,
      importance: parsed.importance ?? "medium",
      timeframe: parsed.timeframe ?? "medium",
      confidence: Math.min(Math.max(parsed.confidence ?? 0.5, 0.1), 0.9),
      suggestedQuestions: parsed.suggestedQuestions,
      betterPhrasing: parsed.betterPhrasing
    };
  } catch (error) {
    console.error("Error in analyzeDecisionContext:", error);
    // Return default values in case of error
    return {
      understood: true,
      importance: "medium",
      timeframe: "medium",
      confidence: 0.5,
      suggestedQuestions: ["Could you provide more details about your decision?"]
    };
  }
};

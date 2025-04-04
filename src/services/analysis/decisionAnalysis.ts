import { callPerplexityAPI } from '../api/perplexityService';
import { buildDecisionAnalysisPrompt } from '../prompts/decisionPrompts';
import { Option } from '../types/decisionTypes';
import { FacebookProfileData } from '../facebook/profileExtractor';

// Analyze a decision with the selected option
export const analyzeDecisionWithLLM = async (
  decisionTitle: string,
  options: Option[],
  context: { importance: string; timeframe: string },
  profileData?: FacebookProfileData | null
): Promise<string> => {
  try {
    const systemPrompt = buildDecisionAnalysisPrompt(context, profileData);
    
    // Build a detailed user prompt with the decision and options
    let userPrompt = `Decision: "${decisionTitle}"\n\nOptions:\n`;
    
    options.forEach((option, index) => {
      userPrompt += `\nOption ${index + 1}: ${option.name}\n`;
      userPrompt += `- Pros: ${option.pros.join(', ')}\n`;
      userPrompt += `- Cons: ${option.cons.join(', ')}\n`;
    });
    
    // Add selected option
    // Note: In this implementation, we're analyzing all options. 
    // In the actual UI, we would only analyze the selected one.
    userPrompt += `\nPlease provide a thoughtful analysis of these options for this decision.`;

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error("Error in analyzeDecisionWithLLM:", error);
    return "I couldn't analyze this decision at the moment. Please try again later.";
  }
};

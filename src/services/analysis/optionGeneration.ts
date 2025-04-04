
import { callPerplexityAPI } from '../api/perplexityService';
import { buildOptionGenerationPrompt } from '../prompts/decisionPrompts';
import { OptionGenerationResponse } from '../types/decisionTypes';
import { FacebookProfileData } from '../facebook/profileExtractor';

// Generate options for a decision using Perplexity
export const generateOptionsWithLLM = async (
  decisionTitle: string,
  profileData?: FacebookProfileData | null
): Promise<OptionGenerationResponse> => {
  try {
    const systemPrompt = buildOptionGenerationPrompt(profileData);
    const userPrompt = `Generate options for this decision: "${decisionTitle}"`;

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    
    // Parse the JSON response
    let parsed: OptionGenerationResponse;
    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error("Failed to parse Perplexity response:", error);
      console.log("Raw response:", result);
      
      // Return empty options if parsing fails
      return { options: [] };
    }
    
    // Ensure the options array is valid
    return {
      options: Array.isArray(parsed.options) ? parsed.options : []
    };
  } catch (error) {
    console.error("Error in generateOptionsWithLLM:", error);
    // Return empty options in case of error
    return { options: [] };
  }
};

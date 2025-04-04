
import { callPerplexityAPI } from '../api/perplexityService';
import { buildOptionGenerationPrompt } from '../prompts/decisionPrompts';
import { OptionGenerationResponse } from '../types/decisionTypes';

// Generate options using Perplexity
export const generateOptionsWithLLM = async (
  decisionTitle: string
): Promise<OptionGenerationResponse> => {
  try {
    const systemPrompt = buildOptionGenerationPrompt();
    const userPrompt = `Generate options for this decision: "${decisionTitle}"`;

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    
    // Parse the JSON response
    let parsed: OptionGenerationResponse;
    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error("Failed to parse Perplexity options response:", error);
      console.log("Raw options response:", result);
      
      // Return default options if parsing fails
      return {
        options: [
          {
            name: "Option A",
            pros: ["Pro 1", "Pro 2", "Pro 3"],
            cons: ["Con 1", "Con 2", "Con 3"]
          },
          {
            name: "Option B",
            pros: ["Pro 1", "Pro 2", "Pro 3"],
            cons: ["Con 1", "Con 2", "Con 3"]
          }
        ]
      };
    }
    
    return {
      options: parsed.options || [],
      rationale: parsed.rationale
    };
  } catch (error) {
    console.error("Error in generateOptionsWithLLM:", error);
    // Return default options in case of error
    return {
      options: [
        {
          name: "Option A",
          pros: ["Pro 1", "Pro 2", "Pro 3"],
          cons: ["Con 1", "Con 2", "Con 3"]
        },
        {
          name: "Option B",
          pros: ["Pro 1", "Pro 2", "Pro 3"],
          cons: ["Con 1", "Con 2", "Con 3"]
        }
      ]
    };
  }
};

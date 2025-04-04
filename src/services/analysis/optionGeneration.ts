
import { callPerplexityAPI } from '../api/perplexityService';
import { buildOptionGenerationPrompt } from '../prompts/decisionPrompts';
import { OptionGenerationResponse } from '../types/decisionTypes';
import { FacebookProfileData } from '../facebook/profileExtractor';

// Function to extract JSON from a potentially markdown-formatted string
const extractJsonFromResponse = (text: string): string => {
  // Try to extract JSON between code blocks if present
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
  const match = text.match(jsonRegex);
  
  if (match) {
    // Return the content of the first capturing group that matches
    return match[1] || match[2];
  }
  
  // If no code blocks found, return the original text
  // (it might be raw JSON already)
  return text;
};

// Generate options using Perplexity
export const generateOptionsWithLLM = async (
  questionTitle: string,
  profileData?: FacebookProfileData | null
): Promise<OptionGenerationResponse> => {
  try {
    const systemPrompt = buildOptionGenerationPrompt(profileData);
    const userPrompt = `Generate options for this question: "${questionTitle}"`;

    console.log("Generating options with profile data:", !!profileData);

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    console.log("Raw LLM options response:", result);
    
    // Extract potential JSON from response (in case LLM wraps it in markdown)
    const jsonContent = extractJsonFromResponse(result);
    console.log("Extracted JSON content:", jsonContent);
    
    // Parse the JSON response
    let parsed: OptionGenerationResponse;
    try {
      parsed = JSON.parse(jsonContent);
      
      // Validate the parsed object has the expected structure
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error("Invalid options structure");
      }
      
      // Make sure each option has the required fields
      parsed.options = parsed.options.map(option => ({
        name: option.name || "Unnamed option",
        pros: Array.isArray(option.pros) ? option.pros : ["Pro 1", "Pro 2", "Pro 3"],
        cons: Array.isArray(option.cons) ? option.cons : ["Con 1", "Con 2", "Con 3"]
      }));
      
    } catch (error) {
      console.error("Failed to parse Perplexity options response:", error);
      console.log("Attempted to parse:", jsonContent);
      
      // Try to extract meaningful content if JSON parsing failed
      const fallbackOptions = attemptToExtractOptionsFromText(result);
      if (fallbackOptions.length > 0) {
        return {
          options: fallbackOptions
        };
      }
      
      // Return default options if all parsing fails
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

// Fallback function that tries to extract option information from free text
const attemptToExtractOptionsFromText = (text: string) => {
  const options = [];
  
  // Look for patterns like "Option 1:" or "1." followed by text
  const optionBlocks = text.split(/(?:Option \d+:|[\d]+\.)\s*/).filter(Boolean);
  
  for (let i = 0; i < Math.min(optionBlocks.length, 4); i++) {
    const block = optionBlocks[i];
    
    if (!block.trim()) continue;
    
    // Try to extract a name from the first line
    const lines = block.split('\n').filter(Boolean);
    const name = lines[0]?.trim() || `Option ${i + 1}`;
    
    // Look for pros and cons sections
    const prosSection = block.match(/(?:Pros|Advantages|Benefits)[\s\S]*?(?:Cons|Disadvantages|Drawbacks|$)/i)?.[0] || '';
    const consSection = block.match(/(?:Cons|Disadvantages|Drawbacks)[\s\S]*/i)?.[0] || '';
    
    // Extract bullet points or numbered items
    const prosMatches = [...prosSection.matchAll(/[-*•]|\d+\.\s+(.*?)(?=\n|$)/g)];
    const consMatches = [...consSection.matchAll(/[-*•]|\d+\.\s+(.*?)(?=\n|$)/g)];
    
    const pros = prosMatches.map(m => m[1]?.trim() || m[0]?.trim()).filter(Boolean).slice(0, 3);
    const cons = consMatches.map(m => m[1]?.trim() || m[0]?.trim()).filter(Boolean).slice(0, 3);
    
    // Ensure we have at least 3 pros and cons
    while (pros.length < 3) pros.push(`Pro ${pros.length + 1}`);
    while (cons.length < 3) cons.push(`Con ${cons.length + 1}`);
    
    options.push({ name, pros, cons });
    
    if (options.length >= 2) break; // Get at least 2 options
  }
  
  return options;
};

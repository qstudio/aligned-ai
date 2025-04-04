
import { callPerplexityAPI } from '../api/perplexityService';
import { buildAnalysisPrompt } from '../prompts/decisionPrompts';
import { DecisionContext } from '../types/decisionTypes';
import { FacebookProfileData } from '../facebook/profileExtractor';

// Analyze decision with Perplexity
export const analyzeDecisionWithLLM = async (
  decisionTitle: string,
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[],
  context: DecisionContext,
  profileData?: FacebookProfileData | null
): Promise<string> => {
  try {
    const systemPrompt = buildAnalysisPrompt(profileData);

    const userPrompt = `
      Decision: "${decisionTitle}"
      
      Options:
      ${options.map((opt, idx) => `
      Option ${idx + 1}: ${opt.name}
      Pros: ${opt.pros.join(", ")}
      Cons: ${opt.cons.join(", ")}
      `).join("\n")}
      
      Importance: ${context.importance}
      Timeframe: ${context.timeframe}
      
      ${profileData ? "Please provide personalized analysis based on the user's profile information included in your system prompt." : ""}
      
      Based on this information, what do you recommend?
    `;

    console.log("Analyzing decision with profile data:", !!profileData);
    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error("Error in analyzeDecisionWithLLM:", error);
    
    // Calculate a weighted score for each option as a fallback
    const scoredOptions = options.map(option => {
      // Count valid items (non-empty strings)
      const validPros = option.pros.filter(p => p.trim()).length;
      const validCons = option.cons.filter(c => c.trim()).length;
      
      // Apply weighted scoring based on context
      let proWeight = 1.0;
      let conWeight = 1.0;
      
      // Add importance weighting
      if (context.importance === "high") {
        conWeight = 1.5; // In high-importance decisions, cons matter more
      } else if (context.importance === "low") {
        proWeight = 1.2; // In low-importance decisions, pros matter slightly more
      }
      
      // Add timeframe weighting
      if (context.timeframe === "long") {
        conWeight *= 1.2; // Long-term decisions should weigh cons more heavily
      } else if (context.timeframe === "short") {
        proWeight *= 1.1; // Short-term decisions can slightly favor pros
      }
      
      // Additional randomization factor (between 0.9 and 1.1) to avoid predictable ties
      const randomFactor = 0.9 + Math.random() * 0.2;
      
      // Calculate weighted score
      const score = (validPros * proWeight * randomFactor) - (validCons * conWeight);
      
      return {
        name: option.name,
        score: score
      };
    });
    
    scoredOptions.sort((a, b) => b.score - a.score);
    const bestOption = scoredOptions[0];
    
    // Fallback analysis
    let analysis = `Recommendation: ${bestOption.name} appears to be the strongest choice based on your analysis.\n\n`;
    
    if (context.importance === "high") {
      analysis += "Since this is a high-importance decision, consider gathering more information or consulting others before finalizing.\n";
    }
    
    if (context.timeframe === "long") {
      analysis += "For this long-term decision, weigh the long-term implications more heavily than short-term conveniences.\n";
    } else if (context.timeframe === "short") {
      analysis += "For this short-term decision, focus on immediate outcomes while being mindful of potential consequences.\n";
    }
    
    return analysis;
  }
};

// Determines the best option based on a sophisticated analysis
export const calculateRecommendedOption = (
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[],
  context: DecisionContext
): number => {
  if (options.length === 0) return -1;
  
  const scores = options.map((option, idx) => {
    // Count valid items (non-empty strings)
    const validPros = option.pros.filter(p => p.trim()).length;
    const validCons = option.cons.filter(c => c.trim()).length;
    
    // Apply weighted scoring based on context
    let proWeight = 1.0;
    let conWeight = 1.0;
    
    // Add importance weighting
    if (context.importance === "high") {
      conWeight = 1.5; // In high-importance decisions, cons matter more
    } else if (context.importance === "low") {
      proWeight = 1.2; // In low-importance decisions, pros matter slightly more
    }
    
    // Add timeframe weighting
    if (context.timeframe === "long") {
      conWeight *= 1.2; // Long-term decisions should weigh cons more heavily
    } else if (context.timeframe === "short") {
      proWeight *= 1.1; // Short-term decisions can slightly favor pros
    }
    
    // Additional randomization factor (between 0.9 and 1.1) to avoid predictable ties
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    // Calculate weighted score with randomization factor
    const score = (validPros * proWeight * randomFactor) - (validCons * conWeight);
    
    return {
      index: idx,
      score: score
    };
  });
  
  // Sort by score in descending order and get the highest-scoring option
  scores.sort((a, b) => b.score - a.score);
  return scores[0].index;
};


import { callPerplexityAPI } from '../api/perplexityService';
import { buildAnalysisPrompt } from '../prompts/decisionPrompts';
import { DecisionContext } from '../types/decisionTypes';

// Analyze decision with Perplexity
export const analyzeDecisionWithLLM = async (
  decisionTitle: string,
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[],
  context: DecisionContext
): Promise<string> => {
  try {
    const systemPrompt = buildAnalysisPrompt();

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
      
      Based on this information, what do you recommend?
    `;

    const result = await callPerplexityAPI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error("Error in analyzeDecisionWithLLM:", error);
    
    // Calculate a simple score for each option as a fallback
    const scoredOptions = options.map(option => {
      const validPros = option.pros.filter(p => p.trim()).length;
      const validCons = option.cons.filter(c => c.trim()).length;
      
      let proWeight = 1;
      let conWeight = 1;
      
      if (context.importance === "high") {
        conWeight = 1.5;
      } else if (context.importance === "low") {
        proWeight = 1.2;
      }
      
      return {
        name: option.name,
        score: (validPros * proWeight) - (validCons * conWeight)
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

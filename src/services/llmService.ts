
import { useToast } from "@/components/ui/use-toast";

// This is a type for context analysis responses from the LLM
export type ContextAnalysisResponse = {
  understood: boolean;
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  suggestedQuestions?: string[];
  betterPhrasing?: string;
};

// This is a type for option generation responses from the LLM
export type OptionGenerationResponse = {
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[];
  rationale?: string;
};

// Store the API key temporarily - in a production app, this should be in a secure backend
const PERPLEXITY_API_KEY = "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";

// Helper function to make calls to the Perplexity API
const callPerplexityAPI = async (systemPrompt: string, userPrompt: string) => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Perplexity API call failed:", error);
    throw error;
  }
};

// Analyze the decision context using Perplexity
export const analyzeDecisionContext = async (
  decisionTitle: string
): Promise<ContextAnalysisResponse> => {
  try {
    const systemPrompt = `
      You are an AI assistant that analyzes decision contexts. You need to extract key information about a decision question.
      You must return your analysis as valid JSON with the following structure:
      {
        "understood": boolean (true if the decision question is clear, false otherwise),
        "importance": "low" or "medium" or "high" (how important this decision appears to be),
        "timeframe": "short" or "medium" or "long" (the time horizon for this decision),
        "confidence": number between 0.1 and 0.9 (how confident you are in your analysis),
        "suggestedQuestions": array of strings (if the decision needs clarification),
        "betterPhrasing": string (optional better phrasing for unclear decisions)
      }
      
      Base your analysis on keywords, context, and explicit/implicit urgency and importance.
    `;

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

// Generate options using Perplexity
export const generateOptionsWithLLM = async (
  decisionTitle: string
): Promise<OptionGenerationResponse> => {
  try {
    const systemPrompt = `
      You are an AI decision assistant. You need to generate realistic options for a decision question.
      For each option, provide a name, a list of pros, and a list of cons.
      
      You must return your response as valid JSON with the following structure:
      {
        "options": [
          {
            "name": "Option name",
            "pros": ["Pro 1", "Pro 2", ...],
            "cons": ["Con 1", "Con 2", ...]
          },
          ...
        ],
        "rationale": "Brief explanation of your reasoning" (optional)
      }
      
      Provide 2-4 realistic options with at least 3 pros and 3 cons for each option.
      If the question is unclear or cannot be answered, return an empty options array.
    `;

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

// Analyze decision with Perplexity
export const analyzeDecisionWithLLM = async (
  decisionTitle: string,
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[],
  context: {
    importance: "low" | "medium" | "high";
    timeframe: "short" | "medium" | "long";
  }
): Promise<string> => {
  try {
    const systemPrompt = `
      You are an AI decision analyst. You need to analyze a decision based on the options provided and their pros and cons.
      Consider the importance (${context.importance}) and timeframe (${context.timeframe}) of the decision.
      Provide a concise analysis with a clear recommendation.
      Your response should be in plain text, not JSON.
      Start with "Recommendation:" followed by the recommended option, then explain why.
      If the decision is high-importance, suggest gathering more information.
      If it's a long-term decision, emphasize long-term implications.
    `;

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

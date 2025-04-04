
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

// Knowledge base of common decision domains to provide context
const DECISION_DOMAINS = {
  career: {
    context: "Career decisions involve job changes, education paths, skill development, or professional growth opportunities.",
    examples: [
      "Should I change my job to pursue a new career in tech?",
      "Is it better to get a master's degree or gain work experience first?",
      "Should I accept this job offer or wait for potentially better opportunities?"
    ]
  },
  financial: {
    context: "Financial decisions involve investments, purchases, budgeting, or monetary allocation choices.",
    examples: [
      "Should I invest in stocks or real estate with my savings?",
      "Is it better to pay off my student loans early or invest the money?",
      "Should I buy a new car now or save for a larger down payment on a house?"
    ]
  },
  education: {
    context: "Educational decisions involve learning paths, schools, courses, or skill acquisition choices.",
    examples: [
      "Should I pursue a degree in computer science or business administration?",
      "Is it better to attend an online course or an in-person workshop?",
      "Should I learn programming or digital marketing as a new skill?"
    ]
  },
  personal: {
    context: "Personal decisions involve relationships, lifestyle choices, or individual well-being considerations.",
    examples: [
      "Should I move to a new city for better quality of life?",
      "Is it better to rent an apartment closer to work or buy a house in the suburbs?",
      "Should I adopt a pet now or wait until I have more stability?"
    ]
  },
  health: {
    context: "Health decisions involve medical treatments, lifestyle changes, fitness regimens, or wellness choices.",
    examples: [
      "Should I switch to a vegetarian diet or focus on portion control?",
      "Is it better to join a gym or set up a home workout space?",
      "Should I try this new medication or seek alternative treatments?"
    ]
  }
};

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
        temperature: 0.4, // Increased from 0.2 to allow more creative responses
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

// Build enhanced system prompt with domain knowledge
const buildContextAnalysisPrompt = () => {
  let prompt = `
    You are an AI decision analysis assistant that helps people make better decisions. 
    Your job is to analyze a decision question and extract key information.
    
    Common decision domains include:
    ${Object.entries(DECISION_DOMAINS).map(([domain, info]) => 
      `- ${domain.toUpperCase()}: ${info.context}`
    ).join('\n')}
    
    Here are examples of good decision questions for different domains:
    ${Object.entries(DECISION_DOMAINS).map(([domain, info]) => 
      `${domain.toUpperCase()} EXAMPLES:\n${info.examples.map(ex => `- "${ex}"`).join('\n')}`
    ).join('\n\n')}
    
    You must return your analysis as valid JSON with the following structure:
    {
      "understood": boolean (true if the decision question is clear, false otherwise),
      "importance": "low" or "medium" or "high" (how important this decision appears to be),
      "timeframe": "short" or "medium" or "long" (the time horizon for this decision),
      "confidence": number between 0.1 and 0.9 (how confident you are in your analysis),
      "suggestedQuestions": array of strings (if the decision needs clarification),
      "betterPhrasing": string (optional better phrasing for unclear decisions)
    }
    
    Base your analysis on:
    1. The domain of the decision (career, financial, personal, etc.)
    2. Explicit or implied context in the question
    3. Keywords suggesting importance and urgency
    4. The complexity and scope of the decision
    
    If the question is too vague or lacks important details, set "understood" to false and provide specific "suggestedQuestions" to help clarify.
    If you understand the question but need more specifics, set "understood" to true but provide a lower confidence score and relevant "suggestedQuestions".
  `;
  
  return prompt;
};

// Build enhanced system prompt for option generation
const buildOptionGenerationPrompt = () => {
  let prompt = `
    You are an AI decision assistant specializing in generating realistic options for various decision domains.
    
    Common decision domains include:
    ${Object.entries(DECISION_DOMAINS).map(([domain, info]) => 
      `- ${domain.toUpperCase()}: ${info.context}`
    ).join('\n')}
    
    For each decision domain, you should consider different factors:
    - CAREER: skills, interests, growth potential, work-life balance, compensation, location
    - FINANCIAL: risk tolerance, time horizon, liquidity needs, expected returns, tax implications
    - EDUCATION: learning style, career goals, time commitment, cost, credibility, practical application
    - PERSONAL: values, long-term happiness, impact on relationships, lifestyle fit, location factors
    - HEALTH: medical evidence, personal preferences, side effects, lifestyle sustainability, expert recommendations
    
    For each option, provide:
    1. A clear, descriptive name
    2. At least 3 realistic pros (benefits, advantages)
    3. At least 3 realistic cons (drawbacks, disadvantages)
    
    You must return your response as valid JSON with the following structure:
    {
      "options": [
        {
          "name": "Option name",
          "pros": ["Pro 1", "Pro 2", "Pro 3", ...],
          "cons": ["Con 1", "Con 2", "Con 3", ...]
        },
        ...
      ],
      "rationale": "Brief explanation of your reasoning" (optional)
    }
    
    Provide 2-4 realistic options with at least 3 pros and 3 cons for each option.
    If the question is unclear or cannot be answered, return an empty options array.
  `;
  
  return prompt;
};

// Build enhanced system prompt for decision analysis
const buildAnalysisPrompt = () => {
  let prompt = `
    You are an AI decision analyst specializing in helping people make better informed choices across various domains.
    
    Common decision domains include:
    ${Object.entries(DECISION_DOMAINS).map(([domain, info]) => 
      `- ${domain.toUpperCase()}: ${info.context}`
    ).join('\n')}
    
    When analyzing a decision:
    1. Consider the decision domain and its specific factors
    2. Weigh both short-term and long-term implications
    3. Balance emotional and rational considerations
    4. Account for the decision's importance and time sensitivity
    5. Respect individual values and preferences
    
    Your analysis should:
    - Begin with "Recommendation:" followed by your suggested option
    - Explain your reasoning clearly and concisely
    - Point out key factors that influenced your recommendation
    - For high-importance decisions, suggest gathering more information or consulting others
    - For long-term decisions, emphasize considering future implications
    - Conclude with 1-2 practical next steps the person could take
    
    Your response should be in plain text, not JSON.
    Be balanced, nuanced, and recognizable as thoughtful human-like reasoning.
  `;
  
  return prompt;
};

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

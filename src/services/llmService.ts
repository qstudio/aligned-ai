
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

// In a production app, this would connect to an actual LLM API
// For now, we'll use a simulation that mimics LLM behavior
export const analyzeDecisionContext = async (
  decisionTitle: string
): Promise<ContextAnalysisResponse> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const lowerTitle = decisionTitle.toLowerCase();
  
  // Advanced context detection logic
  let importance: "low" | "medium" | "high" = "medium";
  let timeframe: "short" | "medium" | "long" = "medium";
  let confidence = 0.5;
  let understood = true;
  let suggestedQuestions: string[] = [];
  let betterPhrasing: string | undefined;

  // Importance detection
  if (
    lowerTitle.includes("critical") ||
    lowerTitle.includes("important") ||
    lowerTitle.includes("significant") ||
    lowerTitle.includes("major") ||
    lowerTitle.includes("life") ||
    lowerTitle.includes("career") ||
    lowerTitle.includes("marriage") ||
    lowerTitle.includes("health")
  ) {
    importance = "high";
    confidence += 0.2;
  } else if (
    lowerTitle.includes("minor") ||
    lowerTitle.includes("small") ||
    lowerTitle.includes("trivial") ||
    lowerTitle.includes("little")
  ) {
    importance = "low";
    confidence += 0.2;
  }

  // Timeframe detection
  if (
    lowerTitle.includes("urgent") ||
    lowerTitle.includes("immediate") ||
    lowerTitle.includes("today") ||
    lowerTitle.includes("right now") ||
    lowerTitle.includes("quickly")
  ) {
    timeframe = "short";
    confidence += 0.2;
  } else if (
    lowerTitle.includes("long-term") ||
    lowerTitle.includes("future") ||
    lowerTitle.includes("years") ||
    lowerTitle.includes("permanent") ||
    lowerTitle.includes("lifetime")
  ) {
    timeframe = "long";
    confidence += 0.2;
  } else if (
    lowerTitle.includes("next month") ||
    lowerTitle.includes("soon") ||
    lowerTitle.includes("few weeks")
  ) {
    timeframe = "medium";
    confidence += 0.2;
  }

  // Check for clear decision structure
  if (!lowerTitle.includes("should i") && !lowerTitle.includes("or")) {
    understood = false;
    confidence *= 0.7;
    suggestedQuestions.push(
      "Could you phrase this as a clear choice between options?",
      "What specific options are you deciding between?"
    );
  }

  // Check for very short inputs
  if (decisionTitle.trim().length < 15) {
    confidence *= 0.6;
    understood = false;
    suggestedQuestions.push(
      "Could you provide more details about this decision?",
      "What factors are important in making this decision?"
    );
  }

  // Suggest better phrasing if low confidence
  if (confidence < 0.5) {
    if (lowerTitle.includes("should i")) {
      const action = lowerTitle.split("should i")[1].trim().split("?")[0];
      betterPhrasing = `Should I ${action} now or wait until later?`;
    }
  }

  // Cap confidence between 0.1 and 0.9
  confidence = Math.min(Math.max(confidence, 0.1), 0.9);

  return {
    understood,
    importance,
    timeframe,
    confidence,
    suggestedQuestions,
    betterPhrasing,
  };
};

export const generateOptionsWithLLM = async (
  decisionTitle: string
): Promise<OptionGenerationResponse> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const lowerTitle = decisionTitle.toLowerCase();
  
  // Advanced options generation that simulates LLM capabilities
  let options = [
    {
      name: "Option A",
      pros: ["Potential benefit"],
      cons: ["Potential drawback"],
    },
    {
      name: "Option B",
      pros: ["Alternative benefit"],
      cons: ["Different limitation"],
    },
  ];

  // Decision type detection for more specific options
  if (lowerTitle.includes("rain") && lowerTitle.includes("sheep")) {
    options = [
      {
        name: "Go now despite the rain",
        pros: [
          "Sheep get fed on schedule",
          "Complete task without delay",
          "Potentially avoid worsening weather",
        ],
        cons: [
          "You'll get wet and uncomfortable",
          "Potentially slippery conditions",
          "Equipment might get wet",
        ],
      },
      {
        name: "Wait until rain stops",
        pros: [
          "Stay dry and comfortable",
          "Possibly safer conditions later",
          "Equipment stays dry",
        ],
        cons: [
          "Sheep's feeding schedule delayed",
          "Rain might continue longer than expected",
          "Task hanging over your head",
        ],
      },
      {
        name: "Partial solution: quick feed now",
        pros: [
          "Compromise between options",
          "Basic needs of sheep met",
          "Less time in the rain",
        ],
        cons: [
          "Still get somewhat wet",
          "Not as thorough as a full feeding session",
          "May need to return later anyway",
        ],
      },
    ];
  } else if (
    lowerTitle.includes("job") ||
    lowerTitle.includes("career") ||
    lowerTitle.includes("work") ||
    lowerTitle.includes("offer") ||
    lowerTitle.includes("position") ||
    lowerTitle.includes("employment")
  ) {
    options = [
      {
        name: "Accept the offer",
        pros: [
          "New opportunities for growth",
          "Potentially better compensation",
          "Fresh environment",
          "Expand your network",
        ],
        cons: [
          "Uncertainty with new role",
          "Adjustment period",
          "Leaving familiar environment",
          "Potential cultural mismatch",
        ],
      },
      {
        name: "Stay in current position",
        pros: [
          "Stability and familiarity",
          "Established relationships",
          "Known expectations",
          "Accumulated benefits/seniority",
        ],
        cons: [
          "Potential stagnation",
          "Missing new opportunities",
          "Possible career ceiling",
          "Wondering 'what if'",
        ],
      },
      {
        name: "Negotiate better terms",
        pros: [
          "Potentially get better offer",
          "Show confidence in your value",
          "May improve current job too",
          "More information for decision",
        ],
        cons: [
          "Risk offer being withdrawn",
          "Delay in decision making",
          "Potential awkwardness",
          "Additional stress",
        ],
      },
    ];
  }

  // Many more decision types would be handled by a real LLM

  return {
    options,
  };
};

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
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Calculate a simple score for each option
  const scoredOptions = options.map(option => {
    const validPros = option.pros.filter(p => p.trim()).length;
    const validCons = option.cons.filter(c => c.trim()).length;
    
    // Weight pros and cons depending on importance
    let proWeight = 1;
    let conWeight = 1;
    
    if (context.importance === "high") {
      // For high importance, cons weigh more
      conWeight = 1.5;
    } else if (context.importance === "low") {
      // For low importance, pros weigh more
      proWeight = 1.2;
    }
    
    return {
      name: option.name,
      score: (validPros * proWeight) - (validCons * conWeight),
      proCount: validPros,
      conCount: validCons
    };
  });
  
  // Sort by score
  scoredOptions.sort((a, b) => b.score - a.score);
  const bestOption = scoredOptions[0];
  
  let analysis = `Based on your analysis of "${decisionTitle}" (${context.importance} importance, ${context.timeframe}-term decision):\n\n`;
  analysis += "Option comparison:\n";
  
  scoredOptions.forEach((option, index) => {
    analysis += `${index + 1}. ${option.name}: ${option.proCount} pros, ${option.conCount} cons\n`;
  });
  
  analysis += `\nRecommendation: ${bestOption.name} appears to be the strongest choice based on your analysis.\n\n`;
  
  // Add contextual advice
  if (context.importance === "high") {
    analysis += "Since this is a high-importance decision, consider gathering more information or consulting others before finalizing.\n";
  }
  
  if (context.timeframe === "long") {
    analysis += "For this long-term decision, weigh the long-term implications more heavily than short-term conveniences.\n";
  } else if (context.timeframe === "short") {
    analysis += "For this short-term decision, focus on immediate outcomes while being mindful of potential consequences.\n";
  }
  
  return analysis;
};

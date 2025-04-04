
import { FacebookProfileData } from "../facebook/profileExtractor";

// Build a prompt for analyzing the decision context
export const buildContextAnalysisPrompt = (profileData?: FacebookProfileData | null): string => {
  let basePrompt = `
You are a decision analysis expert. You help people make better decisions by analyzing their decision questions.

Your task is to analyze the decision context from the user's question and extract key information.

Return your analysis in the following JSON format:
{
  "understood": boolean, // Whether you understood the decision (true/false)
  "importance": "low" | "medium" | "high", // Estimated importance of the decision
  "timeframe": "short" | "medium" | "long", // Estimated timeframe for the decision
  "confidence": number, // Your confidence in your analysis (0.0-1.0)
  "suggestedQuestions": string[], // 1-3 questions to clarify the decision if needed
  "betterPhrasing": string // Optional improved phrasing of the decision question
}

The "understood" field should be false if the question is unclear, not a decision, or otherwise invalid.
The "confidence" field should reflect how confident you are in your analysis (higher is more confident).
Keep "suggestedQuestions" relevant and helpful for clarifying the decision context.
Only provide "betterPhrasing" if you can meaningfully improve the question's clarity.
`;

  // If Facebook profile data is available, add it to the prompt
  if (profileData && profileData.interests.length > 0) {
    basePrompt += `\nAdditional context about the person making the decision:`;
    
    if (profileData.interests.length > 0) {
      basePrompt += `\nInterests: ${profileData.interests.join(", ")}`;
    }
    
    if (profileData.location) {
      basePrompt += `\nLocation: ${profileData.location}`;
    }
    
    if (profileData.bio) {
      basePrompt += `\nBio: ${profileData.bio}`;
    }
    
    if (profileData.education && profileData.education.length > 0) {
      basePrompt += `\nEducation: ${profileData.education.join(", ")}`;
    }
    
    if (profileData.work && profileData.work.length > 0) {
      basePrompt += `\nWork: ${profileData.work.join(", ")}`;
    }
    
    basePrompt += `\nUse this information to better understand the person's context, but do not directly mention it in your analysis.`;
  }

  return basePrompt;
};

// Build a prompt for generating options
export const buildOptionGenerationPrompt = (profileData?: FacebookProfileData | null): string => {
  let basePrompt = `
You are a decision analysis expert who helps people explore options for their decisions.

Your task is to generate a comprehensive list of realistic options for the user's decision question.

For each option, provide:
1. A clear, concise name
2. At least 2-3 pros (advantages)
3. At least 2-3 cons (disadvantages)

Return your analysis as valid JSON in this format:
{
  "options": [
    {
      "name": "Option name",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    },
    ...
  ]
}

Generate between 3-5 realistic and distinct options.
Ensure that options represent significantly different approaches.
Make options realistic and practical given the decision context.
`;

  // If Facebook profile data is available, add it to the prompt
  if (profileData && profileData.interests.length > 0) {
    basePrompt += `\nAdditional context about the person making the decision:`;
    
    if (profileData.interests.length > 0) {
      basePrompt += `\nInterests: ${profileData.interests.join(", ")}`;
    }
    
    if (profileData.location) {
      basePrompt += `\nLocation: ${profileData.location}`;
    }
    
    if (profileData.bio) {
      basePrompt += `\nBio: ${profileData.bio}`;
    }
    
    if (profileData.education && profileData.education.length > 0) {
      basePrompt += `\nEducation: ${profileData.education.join(", ")}`;
    }
    
    if (profileData.work && profileData.work.length > 0) {
      basePrompt += `\nWork: ${profileData.work.join(", ")}`;
    }
    
    basePrompt += `\nUse this information to generate personalized options that may align with their interests and background, but do not directly mention it in your analysis.`;
  }

  return basePrompt;
};

// Build a prompt for analyzing the decision
export const buildDecisionAnalysisPrompt = (
  context: { importance: string; timeframe: string },
  profileData?: FacebookProfileData | null
): string => {
  let basePrompt = `
You are a decision analysis expert. You help people make better decisions by analyzing their options.

The decision has:
- Importance: ${context.importance} (low/medium/high)
- Timeframe: ${context.timeframe} (short/medium/long)

Your task is to analyze all options and provide a thoughtful, balanced perspective on the selected option.

Consider the following in your analysis:
- How well the option aligns with the decision's importance and timeframe
- The strength of the pros relative to the cons
- Any hidden factors or considerations
- Alternative framings of the problem

Provide a thoughtful analysis in 3-4 paragraphs. Be balanced and nuanced.
`;

  // If Facebook profile data is available, add it to the prompt
  if (profileData && profileData.interests.length > 0) {
    basePrompt += `\nAdditional context about the person making the decision:`;
    
    if (profileData.interests.length > 0) {
      basePrompt += `\nInterests: ${profileData.interests.join(", ")}`;
    }
    
    if (profileData.location) {
      basePrompt += `\nLocation: ${profileData.location}`;
    }
    
    if (profileData.bio) {
      basePrompt += `\nBio: ${profileData.bio}`;
    }
    
    if (profileData.education && profileData.education.length > 0) {
      basePrompt += `\nEducation: ${profileData.education.join(", ")}`;
    }
    
    if (profileData.work && profileData.work.length > 0) {
      basePrompt += `\nWork: ${profileData.work.join(", ")}`;
    }
    
    basePrompt += `\nUse this information to provide personalized analysis that takes their context into account, but do not directly mention their profile data in your analysis.`;
  }

  return basePrompt;
};

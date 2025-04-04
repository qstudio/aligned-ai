
import { PERPLEXITY_API_KEY } from '../constants/decisionDomains';

// Helper function to make calls to the Perplexity API
export const callPerplexityAPI = async (systemPrompt: string, userPrompt: string) => {
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

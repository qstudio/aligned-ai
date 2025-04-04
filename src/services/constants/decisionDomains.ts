
import { DecisionDomainsMap } from '../types/decisionTypes';

// Store the API key temporarily - in a production app, this should be in a secure backend
export const PERPLEXITY_API_KEY = "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";

// Knowledge base of common decision domains to provide context
export const DECISION_DOMAINS: DecisionDomainsMap = {
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

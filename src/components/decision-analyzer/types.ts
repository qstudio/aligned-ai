
import { ReactNode } from "react";

export type Option = {
  name: string;
  pros: string[];
  cons: string[];
};

export type ContextData = {
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
};

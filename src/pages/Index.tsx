import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import CoinFlipper from "@/components/CoinFlipper";
import RandomNumber from "@/components/RandomNumber";
import YesNoDecider from "@/components/YesNoDecider";
import OptionDecider from "@/components/OptionDecider";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";
import { Coins, Calculator, MessageCircleQuestion, ListChecks, Brain } from "lucide-react";
const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState("analyzer");
  return;
};
export default Index;
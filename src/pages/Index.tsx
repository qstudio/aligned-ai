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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-decision-light">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Decision Helper</h1>
            <p className="text-muted-foreground">
              Making better decisions through thoughtful analysis
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="analyzer" className="flex gap-2 items-center">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Analyzer</span>
              </TabsTrigger>
              <TabsTrigger value="options" className="flex gap-2 items-center">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Options</span>
              </TabsTrigger>
              <TabsTrigger value="yesno" className="flex gap-2 items-center">
                <MessageCircleQuestion className="h-4 w-4" />
                <span className="hidden sm:inline">Yes/No</span>
              </TabsTrigger>
              <TabsTrigger value="number" className="flex gap-2 items-center">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Number</span>
              </TabsTrigger>
              <TabsTrigger value="coin" className="flex gap-2 items-center">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Coin</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="mt-0">
              <DecisionAnalyzer />
            </TabsContent>
            
            <TabsContent value="options" className="mt-0">
              <OptionDecider />
            </TabsContent>
            
            <TabsContent value="yesno" className="mt-0">
              <YesNoDecider />
            </TabsContent>
            
            <TabsContent value="number" className="mt-0">
              <RandomNumber />
            </TabsContent>
            
            <TabsContent value="coin" className="mt-0">
              <CoinFlipper />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Decision Helper - Making better decisions through analysis</p>
      </footer>
    </div>
  );
};

export default Index;

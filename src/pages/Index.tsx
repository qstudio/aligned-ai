
import React from "react";
import Header from "@/components/Header";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YesNoDecider from "@/components/YesNoDecider"; 
import { Brain, Sparkles } from "lucide-react";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-3 py-4 max-w-3xl">
        <div className="flex items-center justify-center mb-3">
          <h1 className="text-xl font-semibold text-center flex items-center gap-2">
            <Brain className="h-5 w-5 text-decision-purple" /> 
            Decision Helper AI
          </h1>
        </div>
        
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="analyzer" className="flex items-center gap-1">
              <Brain className="h-4 w-4" /> Decision Analyzer
            </TabsTrigger>
            <TabsTrigger value="yesno" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Quick Decision
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyzer">
            <DecisionAnalyzer />
          </TabsContent>
          
          <TabsContent value="yesno">
            <YesNoDecider />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

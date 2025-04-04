
import React from "react";
import Header from "@/components/Header";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";
import { Brain } from "lucide-react";

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
        
        <DecisionAnalyzer />
      </main>
    </div>
  );
};

export default Index;

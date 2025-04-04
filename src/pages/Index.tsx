
import React from "react";
import Header from "@/components/Header";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";
import { Brain } from "lucide-react";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <DecisionAnalyzer />
      </main>
    </div>
  );
};

export default Index;

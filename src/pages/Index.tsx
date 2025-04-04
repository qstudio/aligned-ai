
import React from "react";
import Header from "@/components/Header";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-3 py-4 max-w-3xl">
        <DecisionAnalyzer />
      </main>
    </div>
  );
};

export default Index;

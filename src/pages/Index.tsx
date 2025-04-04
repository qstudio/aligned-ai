
import React from "react";
import Header from "@/components/Header";
import DecisionAnalyzer from "@/components/DecisionAnalyzer";

const Index: React.FC = () => {
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

          <DecisionAnalyzer />
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Decision Helper - Making better decisions through analysis</p>
      </footer>
    </div>
  );
};

export default Index;

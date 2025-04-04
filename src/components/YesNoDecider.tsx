
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const answers = [
  "Yes", "No", "Definitely yes", "Definitely no", 
  "Maybe", "Probably", "Probably not", "Ask again later",
  "Without a doubt", "Very doubtful", "Cannot predict now",
  "Signs point to yes", "Don't count on it", "Most likely", "Outlook good"
];

const YesNoDecider: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const { toast } = useToast();

  const getDecision = () => {
    if (!question.trim()) {
      toast({
        title: "Empty question",
        description: "Please enter a question first",
        variant: "destructive",
      });
      return;
    }

    setDeciding(true);
    setAnswer(null);
    
    // Simulate thinking delay
    setTimeout(() => {
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(randomAnswer);
      setDeciding(false);
      toast({
        title: "Decision made!",
        description: `The answer is: ${randomAnswer}`,
      });
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Yes/No Decider</CardTitle>
        <CardDescription className="text-center">Ask a yes/no question and get an answer</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="question">Your Question</Label>
          <Textarea
            id="question"
            placeholder="Should I have pizza for dinner?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="h-24 w-full flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
          {deciding ? (
            <div className="animate-pulse text-2xl font-bold text-decision-purple">Thinking...</div>
          ) : answer ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-decision-purple"
            >
              {answer}
            </motion.div>
          ) : (
            <div className="text-xl text-gray-400">Ask your question</div>
          )}
        </div>
        
        <Button 
          onClick={getDecision}
          disabled={deciding}
          className="bg-decision-purple hover:bg-decision-dark text-white font-medium"
        >
          Get Decision
        </Button>
      </CardContent>
    </Card>
  );
};

export default YesNoDecider;

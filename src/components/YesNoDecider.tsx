
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const [hasValidQuestion, setHasValidQuestion] = useState(false);
  const { toast } = useToast();

  const validateQuestion = (q: string) => {
    // Simple validation - just check if there's text
    return q.trim().length > 0;
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuestion = e.target.value;
    setQuestion(newQuestion);
    
    // Clear answer when changing question
    if (answer) setAnswer(null);
    
    // Validate question but don't show outputs until user explicitly asks
    setHasValidQuestion(validateQuestion(newQuestion));
  };

  const getDecision = () => {
    if (!validateQuestion(question)) {
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
            onChange={handleQuestionChange}
            className="min-h-[100px]"
          />
        </div>
        
        {hasValidQuestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
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
              className="bg-decision-purple hover:bg-decision-dark text-white font-medium w-full"
            >
              Get Decision
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default YesNoDecider;

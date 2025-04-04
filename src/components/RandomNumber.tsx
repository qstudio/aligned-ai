
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const RandomNumber: React.FC = () => {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateNumber = () => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    
    if (isNaN(minNum) || isNaN(maxNum)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }
    
    if (minNum >= maxNum) {
      toast({
        title: "Invalid range",
        description: "Maximum value must be greater than minimum value",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setResult(null);

    // Simulate generation delay
    setTimeout(() => {
      const randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      setResult(randomNum);
      setGenerating(false);
      toast({
        title: "Number generated!",
        description: `Your random number is: ${randomNum}`,
      });
    }, 600);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Random Number</CardTitle>
        <CardDescription className="text-center">Generate a random number in a range</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="min">Minimum</Label>
            <Input
              id="min"
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="max">Maximum</Label>
            <Input
              id="max"
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>
        
        <div className="h-24 w-full flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
          {generating ? (
            <div className="animate-bounce text-4xl font-bold text-decision-purple">?</div>
          ) : result !== null ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold text-decision-purple"
            >
              {result}
            </motion.div>
          ) : (
            <div className="text-4xl text-gray-400">?</div>
          )}
        </div>
        
        <Button 
          onClick={generateNumber}
          disabled={generating}
          className="bg-decision-purple hover:bg-decision-dark text-white font-medium"
        >
          Generate Number
        </Button>
      </CardContent>
    </Card>
  );
};

export default RandomNumber;

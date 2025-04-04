
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const CoinFlipper: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [interactionStarted, setInteractionStarted] = useState(false);
  const { toast } = useToast();

  const flipCoin = () => {
    setInteractionStarted(true);
    setFlipping(true);
    setResult(null);
    
    // Simulate flipping delay
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(outcome);
      setFlipping(false);
      toast({
        title: "Coin flipped!",
        description: `The result is: ${outcome}`,
      });
    }, 600);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Coin Flipper</CardTitle>
        <CardDescription className="text-center">Heads or tails? Let fate decide.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button 
          onClick={flipCoin}
          disabled={flipping}
          className="bg-decision-purple hover:bg-decision-dark text-white font-medium"
        >
          Flip Coin
        </Button>

        {interactionStarted && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <div className="h-32 w-32 flex items-center justify-center bg-secondary rounded-full overflow-hidden">
              {flipping ? (
                <div className="animate-flip text-5xl font-bold text-decision-purple">?</div>
              ) : result ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-decision-purple"
                >
                  {result}
                </motion.div>
              ) : (
                <div className="text-3xl text-gray-400">?</div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoinFlipper;

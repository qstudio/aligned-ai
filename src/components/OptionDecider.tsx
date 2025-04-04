
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const OptionDecider: React.FC = () => {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [currentOption, setCurrentOption] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const { toast } = useToast();

  const addOption = () => {
    if (!currentOption.trim()) {
      toast({
        title: "Empty option",
        description: "Please enter an option first",
        variant: "destructive",
      });
      return;
    }
    
    setOptions([...options, currentOption]);
    setCurrentOption("");
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const chooseRandom = () => {
    // Filter out empty options
    const validOptions = options.filter(option => option.trim());
    
    if (validOptions.length < 2) {
      toast({
        title: "Not enough options",
        description: "Please add at least two valid options",
        variant: "destructive",
      });
      return;
    }

    setDeciding(true);
    setResult(null);
    
    // Simulate decision delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * validOptions.length);
      const chosen = validOptions[randomIndex];
      setResult(chosen);
      setDeciding(false);
      toast({
        title: "Decision made!",
        description: `The chosen option is: ${chosen}`,
      });
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Option Picker</CardTitle>
        <CardDescription className="text-center">Enter options and get a random selection</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-4">
          <Label>Your Options</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={currentOption}
            onChange={(e) => setCurrentOption(e.target.value)}
            placeholder="New option"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addOption();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={addOption}
            className="whitespace-nowrap"
          >
            Add Option
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <div className="h-24 w-full flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
          {deciding ? (
            <div className="animate-ping text-2xl font-bold text-decision-purple">...</div>
          ) : result ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="text-2xl font-bold text-decision-purple p-4 text-center"
            >
              {result}
            </motion.div>
          ) : (
            <div className="text-xl text-gray-400">Your selection will appear here</div>
          )}
        </div>
        
        <Button 
          onClick={chooseRandom}
          disabled={deciding}
          className="bg-decision-purple hover:bg-decision-dark text-white font-medium"
        >
          Choose Random Option
        </Button>
      </CardContent>
    </Card>
  );
};

export default OptionDecider;

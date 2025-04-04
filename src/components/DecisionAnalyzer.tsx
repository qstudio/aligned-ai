
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Trash2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Option = {
  name: string;
  pros: string[];
  cons: string[];
};

const DecisionAnalyzer: React.FC = () => {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { name: "", pros: [""], cons: [""] },
    { name: "", pros: [""], cons: [""] },
  ]);
  const [currentPro, setCurrentPro] = useState("");
  const [currentCon, setCurrentCon] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addOption = () => {
    setOptions([...options, { name: "", pros: [""], cons: [""] }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const addPro = (index: number) => {
    if (!currentPro.trim()) {
      toast({
        title: "Empty pro",
        description: "Please enter a pro first",
        variant: "destructive",
      });
      return;
    }

    const newOptions = [...options];
    newOptions[index].pros.push(currentPro);
    setOptions(newOptions);
    setCurrentPro("");
  };

  const addCon = (index: number) => {
    if (!currentCon.trim()) {
      toast({
        title: "Empty con",
        description: "Please enter a con first",
        variant: "destructive",
      });
      return;
    }

    const newOptions = [...options];
    newOptions[index].cons.push(currentCon);
    setOptions(newOptions);
    setCurrentCon("");
  };

  const removePro = (optionIndex: number, proIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].pros.splice(proIndex, 1);
    setOptions(newOptions);
  };

  const removeCon = (optionIndex: number, conIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].cons.splice(conIndex, 1);
    setOptions(newOptions);
  };

  const generateOptions = () => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title before generating options",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Clear previous options
    setOptions([]);
    
    // Simulate AI generating options (in a real app, this would call an AI API)
    setTimeout(() => {
      const generatedOptions = generateSampleOptions(decisionTitle);
      setOptions(generatedOptions);
      setIsGenerating(false);
      
      toast({
        title: "Options generated",
        description: "Sample options created based on your decision",
      });
    }, 1500);
  };
  
  // Function to generate sample options based on decision title
  const generateSampleOptions = (title: string): Option[] => {
    // This is a simple rules-based generator that looks for keywords
    // In a real app, this would use an AI API
    const lowerTitle = title.toLowerCase();
    
    // Default options if no keywords match
    let optionSet: Option[] = [
      {
        name: "Option A",
        pros: ["General benefit"],
        cons: ["Potential drawback"]
      },
      {
        name: "Option B",
        pros: ["Alternative benefit"],
        cons: ["Different limitation"]
      }
    ];
    
    // Career decision
    if (lowerTitle.includes("job") || lowerTitle.includes("career") || lowerTitle.includes("work")) {
      optionSet = [
        {
          name: "Accept the offer",
          pros: ["New opportunities for growth"],
          cons: ["Uncertainty and adjustment period"]
        },
        {
          name: "Stay in current position",
          pros: ["Stability and familiarity"],
          cons: ["Potential for stagnation"]
        }
      ];
    }
    // Purchase decision
    else if (lowerTitle.includes("buy") || lowerTitle.includes("purchase")) {
      optionSet = [
        {
          name: "Make the purchase now",
          pros: ["Immediate satisfaction and use"],
          cons: ["Financial impact"]
        },
        {
          name: "Delay or forgo the purchase",
          pros: ["Financial savings"],
          cons: ["Missing out on benefits"]
        }
      ];
    }
    // Education decision
    else if (lowerTitle.includes("school") || lowerTitle.includes("study") || lowerTitle.includes("learn")) {
      optionSet = [
        {
          name: "Pursue further education",
          pros: ["Knowledge and credential acquisition"],
          cons: ["Time and financial investment"]
        },
        {
          name: "Enter workforce directly",
          pros: ["Immediate income and experience"],
          cons: ["Potential career ceiling without credentials"]
        }
      ];
    }
    // Relationship decision
    else if (lowerTitle.includes("relationship") || lowerTitle.includes("partner") || lowerTitle.includes("marry")) {
      optionSet = [
        {
          name: "Commit to the relationship",
          pros: ["Emotional connection and support"],
          cons: ["Reduced personal freedom"]
        },
        {
          name: "Maintain independence",
          pros: ["Personal freedom and growth"],
          cons: ["Potential loneliness"]
        }
      ];
    }
    // Moving decision
    else if (lowerTitle.includes("move") || lowerTitle.includes("relocate") || lowerTitle.includes("home")) {
      optionSet = [
        {
          name: "Relocate",
          pros: ["New environment and opportunities"],
          cons: ["Leaving behind familiar surroundings and connections"]
        },
        {
          name: "Stay in current location",
          pros: ["Established community and familiarity"],
          cons: ["Missing potential opportunities elsewhere"]
        }
      ];
    }
    
    return optionSet;
  };

  const analyzeDecision = () => {
    // Validate inputs
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(
      (option) => option.name.trim() && 
      option.pros.some(pro => pro.trim()) && 
      option.cons.some(con => con.trim())
    );

    if (validOptions.length < 2) {
      toast({
        title: "Insufficient options",
        description: "Please provide at least two options with names, pros, and cons",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
    // Simulate analysis delay (in a real app, this would be an API call to an AI service)
    setTimeout(() => {
      let suggestionText = "";
      
      // Find option with most pros and fewest cons
      const optionScores = options.map((option, index) => {
        const validPros = option.pros.filter(p => p.trim()).length;
        const validCons = option.cons.filter(c => c.trim()).length;
        return {
          index,
          score: validPros - validCons,
          name: option.name
        };
      });
      
      optionScores.sort((a, b) => b.score - a.score);
      const bestOption = optionScores[0];
      
      // Generate analysis text based on decision factors
      suggestionText = `Based on your analysis of "${decisionTitle}" (${importance} importance, ${timeframe}-term decision):\n\n`;
      
      // Add option comparison
      suggestionText += "Option comparison:\n";
      options.forEach((option) => {
        if (option.name.trim()) {
          const validPros = option.pros.filter(p => p.trim()).length;
          const validCons = option.cons.filter(c => c.trim()).length;
          suggestionText += `- ${option.name}: ${validPros} pros, ${validCons} cons\n`;
        }
      });
      
      suggestionText += `\nRecommendation: ${bestOption.name} appears to be the stronger choice based on your analysis.\n\n`;
      
      // Add contextual advice
      if (importance === "high") {
        suggestionText += "Since this is a high-importance decision, consider gathering more information or consulting others before finalizing.\n";
      }
      
      if (timeframe === "long") {
        suggestionText += "For this long-term decision, weigh the long-term implications more heavily than short-term conveniences.\n";
      } else if (timeframe === "short") {
        suggestionText += "For this short-term decision, focus on immediate outcomes while being mindful of potential consequences.\n";
      }
      
      // Set the analysis and update state
      setAnalysis(suggestionText);
      setSelectedOptionIndex(bestOption.index);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: `Recommendation: ${bestOption.name}`,
      });
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Decision Analyzer</CardTitle>
        <CardDescription className="text-center">
          Analyze your options to make a more informed decision
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="decision">What decision are you trying to make?</Label>
          <div className="flex gap-2">
            <Input
              id="decision"
              placeholder="e.g., Which job offer should I accept?"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={generateOptions} 
              variant="outline"
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              {isGenerating ? "Generating..." : (
                <>
                  <Wand2 className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Decision importance</Label>
            <RadioGroup
              value={importance}
              onValueChange={(value) => setImportance(value as "low" | "medium" | "high")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-between items-center">
            <Label>Time frame</Label>
            <RadioGroup
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as "short" | "medium" | "long")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short">Short</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium-term" />
                <Label htmlFor="medium-term">Medium</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long">Long</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Your Options</Label>
            {options.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Option
              </Button>
            )}
          </div>

          {isGenerating ? (
            <div className="py-8 text-center text-muted-foreground">
              Generating options based on your decision...
            </div>
          ) : options.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Click the "Generate" button to automatically create options based on your decision.
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto p-1">
              {options.map((option, optionIndex) => (
                <Card key={optionIndex} className={`p-3 ${selectedOptionIndex === optionIndex ? 'border-decision-purple border-2' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <Input
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option.name}
                      onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                      className="flex-1 mr-2"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(optionIndex)}
                        className="h-8 w-8 flex-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pros Section */}
                    <div className="space-y-2">
                      <Label className="text-green-600">Pros</Label>
                      <ScrollArea className="h-32 rounded border p-2">
                        {option.pros.map((pro, proIndex) => (
                          <div key={proIndex} className="flex items-center gap-2 py-1">
                            {proIndex === 0 && !pro.trim() ? (
                              <Input
                                placeholder="Enter a pro"
                                value={pro}
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[optionIndex].pros[proIndex] = e.target.value;
                                  setOptions(newOptions);
                                }}
                                className="flex-1"
                              />
                            ) : pro.trim() ? (
                              <>
                                <div className="flex-1 text-sm flex items-center gap-1">
                                  <span className="text-green-600">+</span> {pro}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePro(optionIndex, proIndex)}
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            ) : null}
                          </div>
                        ))}
                      </ScrollArea>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="New pro"
                          value={currentPro}
                          onChange={(e) => setCurrentPro(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addPro(optionIndex);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPro(optionIndex)}
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Cons Section */}
                    <div className="space-y-2">
                      <Label className="text-red-600">Cons</Label>
                      <ScrollArea className="h-32 rounded border p-2">
                        {option.cons.map((con, conIndex) => (
                          <div key={conIndex} className="flex items-center gap-2 py-1">
                            {conIndex === 0 && !con.trim() ? (
                              <Input
                                placeholder="Enter a con"
                                value={con}
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[optionIndex].cons[conIndex] = e.target.value;
                                  setOptions(newOptions);
                                }}
                                className="flex-1"
                              />
                            ) : con.trim() ? (
                              <>
                                <div className="flex-1 text-sm flex items-center gap-1">
                                  <span className="text-red-600">-</span> {con}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCon(optionIndex, conIndex)}
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            ) : null}
                          </div>
                        ))}
                      </ScrollArea>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="New con"
                          value={currentCon}
                          onChange={(e) => setCurrentCon(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addCon(optionIndex);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addCon(optionIndex)}
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={analyzeDecision}
          disabled={isAnalyzing || options.length < 2}
          className="bg-decision-purple hover:bg-decision-dark text-white font-medium mt-4"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Decision"}
        </Button>
        
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 p-4 bg-secondary rounded-lg"
          >
            <h3 className="font-semibold mb-2">Analysis Result</h3>
            <div className="whitespace-pre-line text-sm">
              {analysis}
            </div>
            {selectedOptionIndex !== null && (
              <div className="mt-4 flex items-center text-decision-purple">
                <Check className="h-5 w-5 mr-2" />
                <span className="font-medium">Recommended: {options[selectedOptionIndex].name}</span>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default DecisionAnalyzer;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Trash2, Wand2, AlertCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Option = {
  name: string;
  pros: string[];
  cons: string[];
};

type ContextData = {
  importance: "low" | "medium" | "high";
  timeframe: "short" | "medium" | "long";
  confidence: number;
};

const DecisionAnalyzer: React.FC = () => {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [options, setOptions] = useState<Option[]>([{
    name: "",
    pros: [""],
    cons: [""]
  }, {
    name: "",
    pros: [""],
    cons: [""]
  }]);
  const [currentPro, setCurrentPro] = useState("");
  const [currentCon, setCurrentCon] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [extractedContext, setExtractedContext] = useState<ContextData>({
    importance: "medium",
    timeframe: "medium",
    confidence: 0.5
  });
  const [needsMoreContext, setNeedsMoreContext] = useState(false);
  const [manualImportance, setManualImportance] = useState<"low" | "medium" | "high">("medium");
  const [manualTimeframe, setManualTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [openOptionIndexes, setOpenOptionIndexes] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const {
    toast
  } = useToast();

  const addOption = () => {
    const newOption = {
      name: "",
      pros: [""],
      cons: [""]
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    setOpenOptionIndexes([...openOptionIndexes, options.length]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    setOpenOptionIndexes(openOptionIndexes.filter(i => i !== index).map(i => i > index ? i - 1 : i));
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
        variant: "destructive"
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
        variant: "destructive"
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

  const toggleOptionOpen = (index: number) => {
    if (openOptionIndexes.includes(index)) {
      setOpenOptionIndexes(openOptionIndexes.filter(i => i !== index));
    } else {
      setOpenOptionIndexes([...openOptionIndexes, index]);
    }
  };

  const extractContextFromTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    let importance: "low" | "medium" | "high" = "medium";
    let timeframe: "short" | "medium" | "long" = "medium";
    let confidence = 0.4; // Default low confidence

    if (lowerTitle.includes("critical") || lowerTitle.includes("important") || lowerTitle.includes("significant") || lowerTitle.includes("major") || lowerTitle.includes("life") || lowerTitle.includes("career") || lowerTitle.includes("marriage") || lowerTitle.includes("health")) {
      importance = "high";
      confidence = 0.7;
    } else if (lowerTitle.includes("minor") || lowerTitle.includes("small") || lowerTitle.includes("trivial") || lowerTitle.includes("little")) {
      importance = "low";
      confidence = 0.7;
    }
    if (lowerTitle.includes("urgent") || lowerTitle.includes("immediate") || lowerTitle.includes("today") || lowerTitle.includes("right now") || lowerTitle.includes("quickly")) {
      timeframe = "short";
      confidence = 0.8;
    } else if (lowerTitle.includes("long-term") || lowerTitle.includes("future") || lowerTitle.includes("years") || lowerTitle.includes("permanent") || lowerTitle.includes("lifetime")) {
      timeframe = "long";
      confidence = 0.8;
    } else if (lowerTitle.includes("next month") || lowerTitle.includes("soon") || lowerTitle.includes("few weeks")) {
      timeframe = "medium";
      confidence = 0.7;
    }
    if (title.length < 15) {
      confidence = 0.2;
    }
    return {
      importance,
      timeframe,
      confidence
    };
  };

  const processDecisionTitle = () => {
    if (decisionTitle.trim().length > 5) {
      const extracted = extractContextFromTitle(decisionTitle);
      setExtractedContext(extracted);
      if (extracted.confidence < 0.5) {
        setNeedsMoreContext(true);
      }
      setManualImportance(extracted.importance);
      setManualTimeframe(extracted.timeframe);
    }
  };

  const generateOptions = () => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title before generating options",
        variant: "destructive"
      });
      return;
    }
    processDecisionTitle();
    setIsGenerating(true);
    setOptions([]);
    setOpenOptionIndexes([]);
    setShowOptions(true);
    setTimeout(() => {
      const generatedOptions = generateSampleOptions(decisionTitle);
      setOptions(generatedOptions);
      setOpenOptionIndexes(generatedOptions.map((_, index) => index));
      setIsGenerating(false);
      toast({
        title: "Options generated",
        description: "Sample options created based on your decision"
      });
    }, 1500);
  };

  const generateSampleOptions = (title: string): Option[] => {
    const lowerTitle = title.toLowerCase();
    
    let optionSet: Option[] = [
      {
        name: "Option A",
        pros: ["Potential benefit"],
        cons: ["Potential drawback"]
      }, 
      {
        name: "Option B",
        pros: ["Alternative benefit"],
        cons: ["Different limitation"]
      }
    ];

    if (lowerTitle.includes("job") || lowerTitle.includes("career") || lowerTitle.includes("work") || 
        lowerTitle.includes("offer") || lowerTitle.includes("position") || lowerTitle.includes("employment")) {
      optionSet = [
        {
          name: "Accept the offer",
          pros: ["New opportunities for growth", "Potentially better compensation", "Fresh environment"],
          cons: ["Uncertainty with new role", "Adjustment period", "Leaving familiar environment"]
        },
        {
          name: "Stay in current position",
          pros: ["Stability and familiarity", "Established relationships", "Known expectations"],
          cons: ["Potential stagnation", "Missing new opportunities", "Possible career ceiling"]
        }
      ];
    } 
    else if (lowerTitle.includes("buy") || lowerTitle.includes("purchase") || 
             lowerTitle.includes("get") || lowerTitle.includes("spend")) {
      
      const item = extractItemFromTitle(lowerTitle);
      
      optionSet = [
        {
          name: `Buy ${item} now`,
          pros: ["Immediate benefit and use", "Current market options", "Solves present need"],
          cons: ["Financial impact", "Commitment to this choice", "Potential for buyer's remorse"]
        },
        {
          name: `Wait on ${item} purchase`,
          pros: ["Financial savings", "More time to research options", "Potential for price drops"],
          cons: ["Delayed benefits", "Continued need gap", "Risk of price increases"]
        }
      ];
    }
    else if (lowerTitle.includes("school") || lowerTitle.includes("study") || lowerTitle.includes("learn") || 
             lowerTitle.includes("education") || lowerTitle.includes("college") || lowerTitle.includes("degree")) {
      optionSet = [
        {
          name: "Pursue further education",
          pros: ["Knowledge and credential acquisition", "Career advancement potential", "Personal growth"],
          cons: ["Time investment", "Financial cost", "Delayed income potential"]
        },
        {
          name: "Enter workforce directly",
          pros: ["Immediate income", "Practical experience", "No student debt"],
          cons: ["Potential career ceiling", "Fewer credentials", "Harder to change fields later"]
        }
      ];
    }
    else if (lowerTitle.includes("relationship") || lowerTitle.includes("partner") || 
             lowerTitle.includes("marry") || lowerTitle.includes("boyfriend") || 
             lowerTitle.includes("girlfriend") || lowerTitle.includes("date") ||
             lowerTitle.includes("breakup") || lowerTitle.includes("divorce")) {
      optionSet = [
        {
          name: "Continue the relationship",
          pros: ["Emotional connection and support", "Shared history and understanding", "Relationship stability"],
          cons: ["Current issues may persist", "Potential for future regret", "Opportunity cost of other paths"]
        },
        {
          name: "End the relationship",
          pros: ["Freedom to pursue other paths", "Elimination of current issues", "Personal growth opportunity"],
          cons: ["Emotional pain and adjustment", "Loss of connection", "Uncertainty about the future"]
        }
      ];
    }
    else if (lowerTitle.includes("move") || lowerTitle.includes("relocate") || 
             lowerTitle.includes("home") || lowerTitle.includes("city") || 
             lowerTitle.includes("apartment") || lowerTitle.includes("house")) {
      optionSet = [
        {
          name: "Make the move",
          pros: ["New environment and opportunities", "Potential lifestyle improvements", "Fresh start"],
          cons: ["Leaving behind familiar surroundings", "Moving costs and hassle", "Adjustment period"]
        },
        {
          name: "Stay where you are",
          pros: ["Established community and familiarity", "Avoiding moving costs", "Stability"],
          cons: ["Missing potential opportunities elsewhere", "Remaining issues unsolved", "Potential stagnation"]
        }
      ];
    }
    else if (lowerTitle.includes("travel") || lowerTitle.includes("vacation") || 
             lowerTitle.includes("trip") || lowerTitle.includes("visit") || 
             lowerTitle.includes("holiday")) {
      optionSet = [
        {
          name: "Take the trip",
          pros: ["New experiences and memories", "Break from routine", "Cultural enrichment"],
          cons: ["Financial cost", "Time away from work/commitments", "Planning stress"]
        },
        {
          name: "Stay home/postpone",
          pros: ["Financial savings", "No disruption to routine", "Opportunity for local activities"],
          cons: ["Missed experiences", "Potential disappointment", "Continued desire to travel"]
        }
      ];
    }
    else if (lowerTitle.includes("health") || lowerTitle.includes("doctor") || 
             lowerTitle.includes("treatment") || lowerTitle.includes("surgery") ||
             lowerTitle.includes("diet") || lowerTitle.includes("exercise")) {
      optionSet = [
        {
          name: "Pursue treatment/change",
          pros: ["Potential health improvement", "Addressing the issue directly", "Peace of mind"],
          cons: ["Potential side effects", "Financial cost", "Recovery/adjustment time"]
        },
        {
          name: "Seek alternatives/wait",
          pros: ["Avoiding immediate intervention", "Time to consider options", "Possibly less invasive"],
          cons: ["Problem may worsen", "Continued symptoms/issues", "Delayed resolution"]
        }
      ];
    }
    else if (lowerTitle.includes("should i")) {
      const action = extractActionFromTitle(lowerTitle);
      
      optionSet = [
        {
          name: `Yes, ${action}`,
          pros: ["Potential for positive outcome", "Taking action rather than wondering", "New experience"],
          cons: ["Risk of negative outcome", "Commitment of resources", "Potential regret"]
        },
        {
          name: `No, don't ${action}`,
          pros: ["Avoiding potential risks", "Conserving resources", "Maintaining status quo"],
          cons: ["Missing potential benefits", "Continued indecision", "Possible regret of inaction"]
        }
      ];
    }
    
    return optionSet;
  };

  const extractItemFromTitle = (title: string): string => {
    const cleanTitle = title.replace(/should i buy|should i get|should i purchase|buy or not|get or not/gi, '').trim();
    
    if (cleanTitle.includes(" or ")) {
      return "the item";
    }
    
    return cleanTitle || "the item";
  };

  const extractActionFromTitle = (title: string): string => {
    const match = title.match(/should i\s+(.+?)(?:\?|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return "proceed with this action";
  };

  const analyzeDecision = () => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title",
        variant: "destructive"
      });
      return;
    }
    const validOptions = options.filter(option => option.name.trim() && option.pros.some(pro => pro.trim()) && option.cons.some(con => con.trim()));
    if (validOptions.length < 2) {
      toast({
        title: "Insufficient options",
        description: "Please provide at least two options with names, pros, and cons",
        variant: "destructive"
      });
      return;
    }
    processDecisionTitle();
    setIsAnalyzing(true);
    setAnalysis(null);
    const finalImportance = needsMoreContext ? manualImportance : extractedContext.importance;
    const finalTimeframe = needsMoreContext ? manualTimeframe : extractedContext.timeframe;
    setTimeout(() => {
      let suggestionText = "";
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
      suggestionText = `Based on your analysis of "${decisionTitle}" (${finalImportance} importance, ${finalTimeframe}-term decision):\n\n`;
      suggestionText += "Option comparison:\n";
      options.forEach(option => {
        if (option.name.trim()) {
          const validPros = option.pros.filter(p => p.trim()).length;
          const validCons = option.cons.filter(c => c.trim()).length;
          suggestionText += `- ${option.name}: ${validPros} pros, ${validCons} cons\n`;
        }
      });
      suggestionText += `\nRecommendation: ${bestOption.name} appears to be the stronger choice based on your analysis.\n\n`;
      if (finalImportance === "high") {
        suggestionText += "Since this is a high-importance decision, consider gathering more information or consulting others before finalizing.\n";
      }
      if (finalTimeframe === "long") {
        suggestionText += "For this long-term decision, weigh the long-term implications more heavily than short-term conveniences.\n";
      } else if (finalTimeframe === "short") {
        suggestionText += "For this short-term decision, focus on immediate outcomes while being mindful of potential consequences.\n";
      }
      setAnalysis(suggestionText);
      setSelectedOptionIndex(bestOption.index);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: `Recommendation: ${bestOption.name}`
      });
    }, 1500);
  };

  return <Card className="w-full">
      <CardHeader>
        
        
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          
          <div className="flex gap-2">
            <Input 
              id="decision" 
              placeholder="It's raining outside and I need to go and feed my sheep - should I go now or later?" 
              value={decisionTitle} 
              onChange={e => setDecisionTitle(e.target.value)} 
              className="flex-1" 
            />
            <Button 
              onClick={generateOptions} 
              variant="outline" 
              disabled={isGenerating || !decisionTitle.trim()} 
              className="flex items-center gap-1"
            >
              {isGenerating ? "Generating..." : <>
                  <Wand2 className="h-4 w-4" /> Generate
                </>}
            </Button>
          </div>
        </div>

        {decisionTitle.length > 0 && <div className="p-3 bg-secondary/50 rounded-md flex items-start gap-2">
            <div className="mt-0.5">
              {extractedContext.confidence >= 0.5 ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
            </div>
            <div className="text-sm flex-1">
              <p className="font-medium">
                {extractedContext.confidence >= 0.5 ? "I understand your decision context" : "I may need more information about your decision"}
              </p>
              <p className="text-muted-foreground">
                This appears to be a{" "}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">
                      {extractedContext.importance} importance
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      {extractedContext.importance === "high" ? "High importance decisions significantly impact your life or well-being." : extractedContext.importance === "medium" ? "Medium importance decisions have moderate consequences but aren't life-changing." : "Low importance decisions have minor impact and consequences."}
                    </p>
                  </HoverCardContent>
                </HoverCard>
                ,{" "}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">
                      {extractedContext.timeframe}-term
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      {extractedContext.timeframe === "long" ? "Long-term decisions have effects that last for years." : extractedContext.timeframe === "medium" ? "Medium-term decisions have effects lasting weeks to months." : "Short-term decisions have immediate effects but don't last long."}
                    </p>
                  </HoverCardContent>
                </HoverCard>
                {" "}decision.
                {extractedContext.confidence < 0.5 && <Button variant="link" className="text-decision-purple p-0 h-auto text-sm" onClick={() => setNeedsMoreContext(true)}>
                    Provide more context
                  </Button>}
              </p>
            </div>
          </div>}

        <Dialog open={needsMoreContext} onOpenChange={setNeedsMoreContext}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add more context to your decision</DialogTitle>
              <DialogDescription>
                This helps us provide more accurate analysis and recommendations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>How important is this decision?</Label>
                <div className="flex gap-2">
                  <Button variant={manualImportance === "low" ? "default" : "outline"} className="flex-1" onClick={() => setManualImportance("low")}>
                    Low
                  </Button>
                  <Button variant={manualImportance === "medium" ? "default" : "outline"} className="flex-1" onClick={() => setManualImportance("medium")}>
                    Medium
                  </Button>
                  <Button variant={manualImportance === "high" ? "default" : "outline"} className="flex-1" onClick={() => setManualImportance("high")}>
                    High
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>What's the time frame?</Label>
                <div className="flex gap-2">
                  <Button variant={manualTimeframe === "short" ? "default" : "outline"} className="flex-1" onClick={() => setManualTimeframe("short")}>
                    Short
                  </Button>
                  <Button variant={manualTimeframe === "medium" ? "default" : "outline"} className="flex-1" onClick={() => setManualTimeframe("medium")}>
                    Medium
                  </Button>
                  <Button variant={manualTimeframe === "long" ? "default" : "outline"} className="flex-1" onClick={() => setManualTimeframe("long")}>
                    Long
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button">Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showOptions && (
          <>
            <Separator className="my-2" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Your Options</Label>
                {options.length < 5 && <Button variant="outline" size="sm" onClick={addOption} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Option
                  </Button>}
              </div>

              {isGenerating ? <div className="py-8 text-center text-muted-foreground">
                  Generating options based on your decision...
                </div> : options.length === 0 ? <div className="py-8 text-center text-muted-foreground">
                  Click the "Generate" button to automatically create options based on your decision.
                </div> : <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                  {options.map((option, optionIndex) => <Collapsible key={optionIndex} open={openOptionIndexes.includes(optionIndex)} onOpenChange={() => toggleOptionOpen(optionIndex)} className={`rounded-md border ${selectedOptionIndex === optionIndex ? 'border-decision-purple border-2' : ''}`}>
                      <div className="p-3 flex justify-between items-center">
                        <Input placeholder={`Option ${optionIndex + 1}`} value={option.name} onChange={e => updateOptionName(optionIndex, e.target.value)} className="flex-1 mr-2 border-0 focus-visible:ring-0" />
                        <div className="flex items-center gap-1">
                          {options.length > 2 && <Button variant="ghost" size="icon" onClick={e => {
                      e.stopPropagation();
                      removeOption(optionIndex);
                    }} className="h-8 w-8 flex-none">
                              <Trash2 className="h-4 w-4" />
                            </Button>}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronDown className={`h-4 w-4 transition-transform ${openOptionIndexes.includes(optionIndex) ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="p-3 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-green-600">Pros</Label>
                              <ScrollArea className="h-32 rounded border p-2">
                                {option.pros.map((pro, proIndex) => <div key={proIndex} className="flex items-center gap-2 py-1">
                                    {proIndex === 0 && !pro.trim() ? <Input placeholder="Enter a pro" value={pro} onChange={e => {
                              const newOptions = [...options];
                              newOptions[optionIndex].pros[proIndex] = e.target.value;
                              setOptions(newOptions);
                            }} className="flex-1" /> : pro.trim() ? <>
                                        <div className="flex-1 text-sm flex items-center gap-1">
                                          <span className="text-green-600">+</span> {pro}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removePro(optionIndex, proIndex)} className="h-6 w-6">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </> : null}
                                  </div>)}
                              </ScrollArea>
                              <div className="flex items-center gap-2">
                                <Input placeholder="New pro" value={currentPro} onChange={e => setCurrentPro(e.target.value)} className="flex-1" onKeyDown={e => {
                            if (e.key === "Enter") {
                              addPro(optionIndex);
                            }
                          }} />
                                <Button variant="outline" size="sm" onClick={() => addPro(optionIndex)} className="whitespace-nowrap">
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-red-600">Cons</Label>
                              <ScrollArea className="h-32 rounded border p-2">
                                {option.cons.map((con, conIndex) => <div key={conIndex} className="flex items-center gap-2 py-1">
                                    {conIndex === 0 && !con.trim() ? <Input placeholder="Enter a con" value={con} onChange={e => {
                              const newOptions = [...options];
                              newOptions[optionIndex].cons[conIndex] = e.target.value;
                              setOptions(newOptions);
                            }} className="flex-1" /> : con.trim() ? <>
                                        <div className="flex-1 text-sm flex items-center gap-1">
                                          <span className="text-red-600">-</span> {con}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeCon(optionIndex, conIndex)} className="h-6 w-6">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </> : null}
                                  </div>)}
                              </ScrollArea>
                              <div className="flex items-center gap-2">
                                <Input placeholder="New con" value={currentCon} onChange={e => setCurrentCon(e.target.value)} className="flex-1" onKeyDown={e => {
                            if (e.key === "Enter") {
                              addCon(optionIndex);
                            }
                          }} />
                                <Button variant="outline" size="sm" onClick={() => addCon(optionIndex)} className="whitespace-nowrap">
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>)}
                </div>}
            </div>

            <Button onClick={analyzeDecision} disabled={isAnalyzing || options.length < 2} className="bg-decision-purple hover:bg-decision-dark text-white font-medium mt-4">
              {isAnalyzing ? "Analyzing..." : "Analyze Decision"}
            </Button>
            
            {analysis && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="mt-4 p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">Analysis Result</h3>
                <div className="whitespace-pre-line text-sm">
                  {analysis}
                </div>
                {selectedOptionIndex !== null && <div className="mt-4 flex items-center text-decision-purple">
                    <Check className="h-5 w-5 mr-2" />
                    <span className="font-medium">Recommended: {options[selectedOptionIndex].name}</span>
                  </div>}
              </motion.div>}
          </>
        )}
      </CardContent>
    </Card>;
};

export default DecisionAnalyzer;

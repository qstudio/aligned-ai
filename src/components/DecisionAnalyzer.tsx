import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Trash2, Wand2, AlertCircle, ChevronDown, HelpCircle, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { analyzeDecisionContext, generateOptionsWithLLM, analyzeDecisionWithLLM } from "@/services/llmService";
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
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const processDecisionTitle = async () => {
    if (decisionTitle.trim().length > 5) {
      try {
        const contextAnalysis = await analyzeDecisionContext(decisionTitle);
        setExtractedContext({
          importance: contextAnalysis.importance,
          timeframe: contextAnalysis.timeframe,
          confidence: contextAnalysis.confidence
        });
        setNeedsMoreContext(contextAnalysis.confidence < 0.5);
        setManualImportance(contextAnalysis.importance);
        setManualTimeframe(contextAnalysis.timeframe);
        if (contextAnalysis.suggestedQuestions && contextAnalysis.suggestedQuestions.length > 0) {
          setSuggestedQuestions(contextAnalysis.suggestedQuestions);
          setShowSuggestions(true);
        } else {
          setSuggestedQuestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error analyzing decision:", error);
        toast({
          title: "Analysis error",
          description: "Could not analyze your decision context. Using default settings.",
          variant: "destructive"
        });
      }
    }
  };
  const generateOptions = async () => {
    if (!decisionTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a decision title before generating options",
        variant: "destructive"
      });
      return;
    }
    await processDecisionTitle();
    setIsGenerating(true);
    setOptions([]);
    setOpenOptionIndexes([]);
    setShowOptions(true);
    try {
      const generatedOptions = await generateOptionsWithLLM(decisionTitle);
      setOptions(generatedOptions.options);
      setOpenOptionIndexes(generatedOptions.options.map((_, index) => index));
      toast({
        title: "Options generated",
        description: "AI has created options based on your decision"
      });
    } catch (error) {
      console.error("Error generating options:", error);
      toast({
        title: "Generation error",
        description: "Could not generate options. Please try again.",
        variant: "destructive"
      });
      // Fallback to basic options
      setOptions([{
        name: "Option A",
        pros: ["Add pros here"],
        cons: ["Add cons here"]
      }, {
        name: "Option B",
        pros: ["Add pros here"],
        cons: ["Add cons here"]
      }]);
      setOpenOptionIndexes([0, 1]);
    } finally {
      setIsGenerating(false);
    }
  };
  const analyzeDecision = async () => {
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
    await processDecisionTitle();
    setIsAnalyzing(true);
    setAnalysis(null);
    const finalContext = {
      importance: needsMoreContext ? manualImportance : extractedContext.importance,
      timeframe: needsMoreContext ? manualTimeframe : extractedContext.timeframe
    };
    try {
      const analysisResult = await analyzeDecisionWithLLM(decisionTitle, options, finalContext);
      setAnalysis(analysisResult);

      // Find the recommended option
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
      setSelectedOptionIndex(optionScores[0].index);
      toast({
        title: "Analysis complete",
        description: `Recommendation: ${optionScores[0].name}`
      });
    } catch (error) {
      console.error("Error analyzing decision:", error);
      toast({
        title: "Analysis error",
        description: "Could not analyze your decision. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="h-5 w-5 text-decision-purple" />
          Decision Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input id="decision" placeholder="It's raining outside and I need to go and feed my sheep - should I go now or later?" value={decisionTitle} onChange={e => setDecisionTitle(e.target.value)} className="flex-1" />
            <Button onClick={generateOptions} variant="outline" disabled={isGenerating || !decisionTitle.trim()} className="flex items-center gap-1 whitespace-nowrap">
              {isGenerating ? "Generating..." : <>
                <Wand2 className="h-4 w-4" /> Generate
              </>}
            </Button>
          </div>

          {showSuggestions && suggestedQuestions.length > 0 && <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Need more clarity:</p>
                  <ul className="list-disc list-inside text-amber-700 space-y-1">
                    {suggestedQuestions.map((question, idx) => <li key={idx}>{question}</li>)}
                  </ul>
                </div>
              </div>
            </div>}
        </div>

        {decisionTitle.length > 0}

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

        {showOptions && <>
            <Separator className="my-2" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Options</Label>
                {options.length < 5 && <Button variant="outline" size="sm" onClick={addOption} className="h-8 text-xs flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Option
                  </Button>}
              </div>

              {isGenerating ? <div className="py-4 text-center text-muted-foreground text-sm">
                  Generating options based on your decision...
                </div> : options.length === 0 ? <div className="py-4 text-center text-muted-foreground text-sm">
                  Click the "Generate" button to automatically create options based on your decision.
                </div> : <div className="space-y-2 max-h-64 overflow-y-auto px-1 pb-1">
                  {options.map((option, optionIndex) => <Collapsible key={optionIndex} open={openOptionIndexes.includes(optionIndex)} onOpenChange={() => toggleOptionOpen(optionIndex)} className={`rounded-md border ${selectedOptionIndex === optionIndex ? 'border-decision-purple border-2' : ''}`}>
                      <div className="p-2 flex justify-between items-center">
                        <Input placeholder={`Option ${optionIndex + 1}`} value={option.name} onChange={e => updateOptionName(optionIndex, e.target.value)} className="flex-1 mr-2 border-0 focus-visible:ring-0 h-8 text-sm" />
                        <div className="flex items-center gap-1">
                          {options.length > 2 && <Button variant="ghost" size="icon" onClick={e => {
                    e.stopPropagation();
                    removeOption(optionIndex);
                  }} className="h-7 w-7 flex-none">
                              <Trash2 className="h-3 w-3" />
                            </Button>}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ChevronDown className={`h-3 w-3 transition-transform ${openOptionIndexes.includes(optionIndex) ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-green-600">Pros</Label>
                              <ScrollArea className="h-24 rounded border p-1">
                                {option.pros.map((pro, proIndex) => <div key={proIndex} className="flex items-center gap-1 py-1">
                                    {proIndex === 0 && !pro.trim() ? <Input placeholder="Enter a pro" value={pro} onChange={e => {
                            const newOptions = [...options];
                            newOptions[optionIndex].pros[proIndex] = e.target.value;
                            setOptions(newOptions);
                          }} className="flex-1 h-7 text-xs" /> : pro.trim() ? <>
                                        <div className="flex-1 text-xs flex items-center gap-1">
                                          <span className="text-green-600">+</span> {pro}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removePro(optionIndex, proIndex)} className="h-5 w-5">
                                          <Trash2 className="h-2 w-2" />
                                        </Button>
                                      </> : null}
                                  </div>)}
                              </ScrollArea>
                              <div className="flex items-center gap-1">
                                <Input placeholder="New pro" value={currentPro} onChange={e => setCurrentPro(e.target.value)} className="flex-1 h-7 text-xs" onKeyDown={e => {
                          if (e.key === "Enter") {
                            addPro(optionIndex);
                          }
                        }} />
                                <Button variant="outline" size="sm" onClick={() => addPro(optionIndex)} className="h-7 text-xs whitespace-nowrap">
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-red-600">Cons</Label>
                              <ScrollArea className="h-24 rounded border p-1">
                                {option.cons.map((con, conIndex) => <div key={conIndex} className="flex items-center gap-1 py-1">
                                    {conIndex === 0 && !con.trim() ? <Input placeholder="Enter a con" value={con} onChange={e => {
                            const newOptions = [...options];
                            newOptions[optionIndex].cons[conIndex] = e.target.value;
                            setOptions(newOptions);
                          }} className="flex-1 h-7 text-xs" /> : con.trim() ? <>
                                        <div className="flex-1 text-xs flex items-center gap-1">
                                          <span className="text-red-600">-</span> {con}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeCon(optionIndex, conIndex)} className="h-5 w-5">
                                          <Trash2 className="h-2 w-2" />
                                        </Button>
                                      </> : null}
                                  </div>)}
                              </ScrollArea>
                              <div className="flex items-center gap-1">
                                <Input placeholder="New con" value={currentCon} onChange={e => setCurrentCon(e.target.value)} className="flex-1 h-7 text-xs" onKeyDown={e => {
                          if (e.key === "Enter") {
                            addCon(optionIndex);
                          }
                        }} />
                                <Button variant="outline" size="sm" onClick={() => addCon(optionIndex)} className="h-7 text-xs whitespace-nowrap">
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

            <Button onClick={analyzeDecision} disabled={isAnalyzing || options.length < 2} className="bg-decision-purple hover:bg-decision-dark text-white font-medium w-full">
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
        }} className="p-3 bg-secondary rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Analysis Result</h3>
                <div className="whitespace-pre-line text-xs max-h-40 overflow-y-auto">
                  {analysis}
                </div>
                {selectedOptionIndex !== null && <div className="mt-2 flex items-center text-decision-purple">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="font-medium text-sm">
                      Recommended: {options[selectedOptionIndex].name}
                    </span>
                  </div>}
              </motion.div>}
          </>}
      </CardContent>
    </Card>;
};
export default DecisionAnalyzer;
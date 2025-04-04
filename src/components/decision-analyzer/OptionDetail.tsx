import React from "react";
import { motion } from "framer-motion";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Option } from "./types";

interface OptionDetailProps {
  selectedOption: Option;
  selectedOptionIndex: number;
  aiAgreesWithChoice: boolean | null;
  showProsConsForOption: number | null;
  analysis: string | null;
  isAnalyzing: boolean;
}

export const OptionDetail: React.FC<OptionDetailProps> = ({
  selectedOption,
  selectedOptionIndex,
  aiAgreesWithChoice,
  showProsConsForOption,
  analysis,
  isAnalyzing
}) => {
  // Function to convert reference numbers in square brackets to links and format markdown
  const formatAnalysisWithLinks = (text: string) => {
    if (!text) return "";
    
    // First handle the references before we process other markdown
    // Regex to find reference patterns like [1], [2], etc.
    const referenceRegex = /\[(\d+)\]/g;
    
    // Replace references with properly formed links
    let formattedText = text.replace(referenceRegex, (match, refNumber) => {
      // Create a search URL using the option name
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(selectedOption.name)}`;
      return `<a href="${searchUrl}" class="text-blue-600 hover:underline reference-link" data-reference="${refNumber}">[${refNumber}]</a>`;
    });
    
    // Now apply markdown formatting, careful not to affect our links
    
    // Format markdown bold syntax (**text**)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format markdown italic syntax (*text*)
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Format markdown headings (# heading)
    formattedText = formattedText.replace(/^# (.*?)$/gm, '<h3 class="text-lg font-bold">$1</h3>');
    formattedText = formattedText.replace(/^## (.*?)$/gm, '<h4 class="text-md font-semibold">$1</h4>');
    formattedText = formattedText.replace(/^### (.*?)$/gm, '<h5 class="font-medium">$1</h5>');
    
    // Format markdown lists
    formattedText = formattedText.replace(/^\- (.*?)$/gm, '<li class="ml-4">$1</li>');
    
    return formattedText;
  };

  // Handle click on reference links to prevent page reload
  const handleReferenceClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if the clicked element is a reference link
    if (target.tagName === 'A' && target.classList.contains('reference-link')) {
      e.preventDefault();
      
      // Open in new tab instead of navigating in the current window
      const href = target.getAttribute('href');
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
      
      // Log for debugging
      console.log('Reference link clicked:', target.dataset.reference);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="rounded-lg border p-3"
    >
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
        You selected: {selectedOption.name}
        {aiAgreesWithChoice !== null && (
          aiAgreesWithChoice ? (
            <span className="flex items-center text-green-600">
              <ThumbsUp className="h-4 w-4 mr-1" /> AI agrees
            </span>
          ) : (
            <span className="flex items-center text-amber-600">
              <ThumbsDown className="h-4 w-4 mr-1" /> Alined recommends the other option
            </span>
          )
        )}
      </h3>
      
      {showProsConsForOption !== null && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-md p-2 mb-3"
        >
          <h4 className="font-medium text-sm mb-1">{selectedOption.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <h5 className="font-semibold text-green-600 mb-1">Pros</h5>
              <ul className="list-inside space-y-0.5">
                {selectedOption.pros
                  .filter(pro => pro.trim())
                  .map((pro, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-1">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-red-600 mb-1">Cons</h5>
              <ul className="list-inside space-y-0.5">
                {selectedOption.cons
                  .filter(con => con.trim())
                  .map((con, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-600 mr-1">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <div 
        className="text-xs max-h-32 overflow-y-auto whitespace-pre-line bg-gray-50 p-2 rounded"
        onClick={handleReferenceClick}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
            Analyzing your selection...
          </div>
        ) : (
          analysis && (
            <div dangerouslySetInnerHTML={{ __html: formatAnalysisWithLinks(analysis) }} />
          )
        )}
      </div>
    </motion.div>
  );
};

"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function KeywordHighlight({
  wordObj,
}: {
  wordObj: Record<string, string>;
}) {
  if (!wordObj.explanation) return <>{wordObj.word}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded cursor-pointer transition-colors text-primary font-medium">
            {wordObj.word}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{wordObj.explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
          <span
            className={cn(
              "bg-yellow-200 px-1 cursor-pointer rounded hover:bg-yellow-300 transition-colors ",
            )}
          >
            {wordObj.word}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm bg-gray-800 text-white px-3 py-2 rounded shadow-md"
        >
          {wordObj.explanation}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

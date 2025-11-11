import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "border border-gray-300 rounded-lg p-4 min-h-[150px] text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

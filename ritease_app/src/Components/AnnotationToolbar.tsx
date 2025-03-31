"use client";

import { useCallback } from "react";
import { usePDFStore } from "@/store/store";
import { AnnotationType } from "@/types/types";
import { cn } from "@/utils/classNames";

const tools = [
  { type: "highlight", label: "Highlight Text" },
  { type: "underline", label: "Underline Text" },
  { type: "comment", label: "Add Comment" },
  { type: "signature", label: "Add Signature" }
] as const;

export default function AnnotationToolbar({
  className
}: {
  className?: string;
}) {
  const { currentTool, setCurrentTool, color, setAnnotationColor } =
    usePDFStore();

  const handleToolClick = useCallback(
    (tool: AnnotationType) => {
      setCurrentTool(currentTool === tool ? null : tool);
    },
    [currentTool, setCurrentTool]
  );

  return (
    <div
      className={cn("flex items-center gap-4 p-4 bg-white border-b", className)}
    >
      {tools.map(({ type, label }) => (
        <button
        aria-label="Label"
          key={type}
          onClick={() => handleToolClick(type)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium",
            "transition-colors duration-200",
            currentTool === type
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          // aria-pressed={currentTool === type}
        >
          {label}
        </button>
      ))}

      <input
        type="color"
        value={color}
        onChange={(e) => setAnnotationColor(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer"
        aria-label="Annotation color"
      />
    </div>
  );
}

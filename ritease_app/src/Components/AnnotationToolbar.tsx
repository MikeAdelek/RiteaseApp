"use client";

import { useCallback } from "react";
import { usePDFStore } from "@/store/store";
import { AnnotationType } from "@/types/types";
import { cn } from "@/utils/classNames";

const tools = [
  {
    type: "highlight",
    label: "Highlight Text"
  },
  {
    type: "underline",
    label: "Underline Text"
  },
  {
    type: "comment",
    label: "Add Comment"
  },
  {
    type: "signature",
    label: "Add Signature"
  }
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
      className={cn(
        "flex flex-wrap items-center gap-2 p-2 bg-white",
        "sm:flex-nowrap sm:gap-3 sm:p-3",
        className
      )}
    >
      {/* Tool buttons */}
      <div className="flex flex-wrap gap-1 sm:gap-2 flex-1">
        {tools.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleToolClick(type)}
            className={cn(
              "flex items-center justify-center sm:justify-start gap-1 px-2 py-1.5 rounded-md",
              "text-xs sm:text-sm font-medium transition-colors duration-200",
              "min-w-[40px] sm:min-w-0 sm:w-auto",
              currentTool === type
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            aria-label={label}
            title={label}
          >
            {/* <span className="block">{icon}</span> */}
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-2 ml-auto">
        <label
          htmlFor="annotation-color"
          className="text-xs sm:text-sm text-gray-600 hidden sm:block"
        >
          Color:
        </label>
        <input
          id="annotation-color"
          type="color"
          value={color}
          onChange={(e) => setAnnotationColor(e.target.value)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded cursor-pointer border border-gray-300"
          aria-label="Annotation color"
        />
      </div>
    </div>
  );
}

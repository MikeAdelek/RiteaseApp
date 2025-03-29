"use client";

import { usePDFStore } from "@/store/store";
import { AnnotationType } from "@/constant/ApplicationTypes";
import { FaHighlighter, FaPen, FaSignature, FaTimes, FaRegComment } from "react-icons/fa";

export default function AnnotationToolbar() {
  const { currentTool, setCurrentTool } = usePDFStore();

  const tools: {
    type: AnnotationType;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      type: "highlight",
      label: "Highlight",
      icon: FaHighlighter
    },
    {
      type: "underline",
      label: "Underline",
      icon: FaPen
    },
    {
      type: "comment",
      label: "Comment",
      icon: FaRegComment
    },
    {
      type: "signature",
      label: "Signature",
      icon: FaSignature
    }
  ];

  return (
    <div
      className="flex space-x-2"
      role="toolbar"
      aria-label="PDF Annotation Tools"
    >
      {tools.map((tool) => {
        const ToolIcon = tool.icon;
        return (
          <button
            aria-label={tool.label}
            type="button"
            key={tool.type}
            // aria-pressed={currentTool === tool.type}
            title={tool.label}
            onClick={() =>
              setCurrentTool(currentTool === tool.type ? null : tool.type)
            }
            className={`p-2 rounded-md transition-all ${
              currentTool === tool.type
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <ToolIcon />
          </button>
        );
      })}

      {currentTool && (
        <button
          aria-label="Clear selection"
          title="Clear selection"
          type="button"
          onClick={() => setCurrentTool(null)}
          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}

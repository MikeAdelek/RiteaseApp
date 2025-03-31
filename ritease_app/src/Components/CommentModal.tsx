import { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { CommentModalState } from "@/types/types";
import { cn } from "@/utils/classNames";

export default function CommentModal({
  isOpen,
  onClose,
  onSave,
  position,
  initialText = "",
  maxLength = 500
}: CommentModalState) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset text when modal opens
  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      textareaRef.current?.focus();
    }
  }, [isOpen, initialText]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Save on Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (text.trim()) {
          onSave(text);
          setText("");
        }
      }
      // Close on Escape
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [text, onSave, onClose]
  );

  if (!isOpen) return null;

  const charactersLeft = maxLength - text.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <div
      ref={modalRef}
      className={cn(
        "absolute z-30 bg-white shadow-lg rounded-lg p-4",
        "min-w-[300px] max-w-[400px]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      role="dialog"
      aria-label="Add comment"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">Add Comment</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-24 p-2 border rounded resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isOverLimit ? "border-red-500" : undefined
        )}
        placeholder="Add your comment..."
        maxLength={maxLength}
        aria-label="Comment text"
      />

      <div className="flex justify-between items-center mt-2">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-red-500" : "text-gray-500"
          )}
        >
          {charactersLeft} characters remaining
        </span>

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className={cn(
              "px-3 py-1 text-sm rounded",
              "text-gray-600 hover:text-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-gray-400"
            )}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (text.trim() && !isOverLimit) {
                onSave(text);
                setText("");
              }
            }}
            disabled={!text.trim() || isOverLimit}
            className={cn(
              "px-3 py-1 text-sm rounded",
              "text-white transition-colors",
              text.trim() && !isOverLimit
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-blue-400"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

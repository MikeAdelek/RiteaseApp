import React from "react";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  position: { x: number; y: number };
}

export default function CommentModal({
  isOpen,
  onClose,
  onSave,
  position
}: CommentModalProps) {
  const [text, setText] = React.useState("");

  if (!isOpen) return null;

  return (
    <div
      className="absolute z-30 bg-white shadow-lg rounded-lg p-4"
      style={{
        left: position.x + "px",
        top: position.y + "px"
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-24 p-2 border rounded"
        placeholder="Add your comment..."
        autoFocus
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onSave(text);
            setText("");
          }}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}

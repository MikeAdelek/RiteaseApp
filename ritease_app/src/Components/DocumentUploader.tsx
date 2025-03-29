"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePDFStore } from "@/store/store";
import { FaRegFilePdf } from "react-icons/fa";

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

export default function DocumentUploader({
  onUploadComplete
}: DocumentUploaderProps) {
  const { setCurrentDocument } = usePDFStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.target.files?.[0];
      if (!file || file.type !== "application/pdf") return;

      setIsProcessing(true);
      try {
        const fileUrl = URL.createObjectURL(file);

        // Create a new document object
        const document = {
          file,
          name: file.name,
          url: fileUrl,
          annotations: []
        };

        setCurrentDocument(document);
        onUploadComplete();
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [setCurrentDocument, onUploadComplete]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || file.type !== "application/pdf") return;

      setIsProcessing(true);
      try {
        const document = {
          file,
          name: file.name,
          url: URL.createObjectURL(file),
          annotations: []
        };

        setCurrentDocument(document);
        onUploadComplete();
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [setCurrentDocument, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    disabled: isProcessing,
    multiple: false
  });

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isProcessing) {
        fileInputRef.current?.click();
      }
    },
    [isProcessing]
  );

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ease-in-out ${
        isDragActive
          ? "border-blue-500"
          : isProcessing
          ? "border-gray-400 cursor-wait"
          : "border-gray-300 hover:border-blue-500 cursor-pointer"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="hidden"
        disabled={isProcessing}
        aria-label="Upload PDF file"
      />

      <input {...getInputProps()} disabled={isProcessing} />
      <div className="space-y-4">
        <FaRegFilePdf
          className={`h-16 w-16 mx-auto ${
            isProcessing ? "opacity-50" : "hover:text-blue-500"
          }`}
          onClick={handleIconClick}
        />
        <p className="text-gray-600">
          {isProcessing
            ? "Processing PDF..."
            : isDragActive
            ? "Drop the PDF here ..."
            : "Drag and drop a PDF here, or click to select a PDF"}
        </p>
        <em className="text-xs text-gray-500">
          (Only *.pdf files are allowed)
        </em>
      </div>
    </div>
  );
}

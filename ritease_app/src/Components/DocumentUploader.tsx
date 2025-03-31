"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { usePDFStore } from "@/store/store";
import { FaRegFilePdf } from "react-icons/fa";
import { PDFDocument, DocumentUploaderProps, UploadState } from "@/types/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = { "application/pdf": [".pdf"] };

export default function DocumentUploader({
  onUploadComplete
}: DocumentUploaderProps) {
  const { setCurrentDocument } = usePDFStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isProcessing: false,
    error: null
  });

  const createDocument = useCallback((file: File): PDFDocument => {
    const now = new Date();
    return {
      id: uuidv4(),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      annotations: [],
      createdAt: now,
      updatedAt: now
    };
  }, []);

    const validateFile = useCallback((file: File): string | null => {
    if (!file.type.includes("pdf")) {
      return "Only PDF files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 10MB limit";
    }
    return null;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setUploadState((prev) => ({ ...prev, error }));
        return;
      }

      setUploadState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        const document = createDocument(file);
        setCurrentDocument(document);
        onUploadComplete();
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadState((prev) => ({
          ...prev,
          error: "Failed to process PDF file"
        }));
      } finally {
        setUploadState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [setCurrentDocument, onUploadComplete, createDocument, validateFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.target.files?.[0];
      if (!file) return;
      await processFile(file);
    },
    [processFile]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      await processFile(file);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled: uploadState.isProcessing,
    multiple: false,
    maxSize: MAX_FILE_SIZE
  });

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploadState.isProcessing) {
        fileInputRef.current?.click();
      }
    },
    [uploadState.isProcessing]
  );

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ease-in-out ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : uploadState.isProcessing
            ? "border-gray-400 cursor-wait"
            : "border-gray-300 hover:border-blue-500 cursor-pointer"
        }`}
        aria-label="Upload PDF file"
      >
        <input
          aria-label="File input for PDF upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
          disabled={uploadState.isProcessing}
        />

        <input {...getInputProps()} />
        <div className="space-y-4">
          <FaRegFilePdf
            className={`h-16 w-16 mx-auto transition-colors ${
              uploadState.isProcessing ? "opacity-50" : "hover:text-blue-500"
            }`}
            role="img"
            aria-label="PDF icon"
          />
          <p className="text-gray-600">
            {uploadState.isProcessing
              ? "Processing PDF..."
              : isDragActive
              ? "Drop the PDF here ..."
              : "Drag and drop a PDF here, or click to select a PDF"}
          </p>
          <em className="text-xs text-gray-500">
            (Only PDF files up to 10MB are allowed)
          </em>
        </div>
      </div>

      {uploadState.error && (
        <div className="text-red-500 text-sm text-center" role="alert">
          {uploadState.error}
        </div>
      )}
    </div>
  );
}

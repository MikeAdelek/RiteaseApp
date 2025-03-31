import { useState, useCallback } from "react";
import { usePDFStore } from "@/store/store";
import { PDFOperations } from "@/types/types";

export const usePDFOperations = (): PDFOperations => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentDocument, addAnnotation, color } = usePDFStore();

  const loadPDF = useCallback(async () => {
    if (!currentDocument?.file) return;
    try {
      setIsLoading(true);
      // ... loading logic ...
    } catch (error) {
      console.error("Error loading PDF:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument]);

  return {
    isLoading,
    setIsLoading,
    fileData: currentDocument?.file || null,
    loadPDF,
    addAnnotation,
    color
  };
};

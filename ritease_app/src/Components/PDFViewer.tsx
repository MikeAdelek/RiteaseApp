"use client";

import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { usePDFStore } from "@/store/store";
import Canvas from "./Canvas";
import AnnotationToolbar from "./AnnotationToolbar";
import { cn } from "@/utils/classNames";
import { ExportButton } from "./ExportButton";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const pageRef = useRef<HTMLDivElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [pageWidth, setPageWidth] = useState(800);
  const [isLoading, setIsLoading] = useState(true);
  const { currentDocument, currentTool } = usePDFStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (pageRef.current) {
        const containerWidth = pageRef.current.clientWidth;
        setPageWidth(Math.min(containerWidth - 40, 1000)); // Max width 1000px, 20px padding each side
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please upload a PDF document</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <AnnotationToolbar className="mb-4" />
        <ExportButton containerRef={containerRef} />
      </div>
      <div
        ref={containerRef} // Attach the containerRef here
        className="flex-1 relative overflow-auto"
      >
        <div className="relative overflow-hidden">
          <div
            ref={pageRef}
            className={cn(
              "relative mx-auto bg-white shadow-lg",
              "transition-all duration-200 ease-in-out"
            )}
            style={{ width: `${pageWidth}px` }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              </div>
            )}

            <Document
              file={currentDocument.file}
              onLoadSuccess={() => setIsLoading(false)}
              onLoadError={(error) => {
                console.error("Error loading PDF:", error);
                setIsLoading(false);
              }}
              loading={null}
              className="relative z-0"
            >
              <Page
                pageNumber={1}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={null}
                className="select-text"
              />
            </Document>

            <Canvas
              pageRef={pageRef}
              pageWidth={pageWidth}
              pageNumber={1}
              className="z-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

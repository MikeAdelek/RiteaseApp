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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { currentDocument, currentTool } = usePDFStore();

  // Handle window resize and initial sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Get container width and account for padding
        const containerWidth = containerRef.current.clientWidth;
        // For mobile devices, use full width with small padding
        if (window.innerWidth < 640) {
          // sm breakpoint
          setPageWidth(containerWidth - 16); // 8px padding on each side
        } else if (window.innerWidth < 768) {
          // md breakpoint
          setPageWidth(Math.min(containerWidth - 32, 600)); // Max 600px on tablets
        } else {
          setPageWidth(Math.min(containerWidth - 40, 1000)); // Max 1000px on larger screens
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle document loading
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Page navigation functions
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please upload a PDF document</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tools - stack vertically on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-4 border-b gap-2">
        <AnnotationToolbar className="w-full sm:w-auto" />
        <ExportButton />
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-auto p-2 sm:p-4">
        <div ref={containerRef} className="relative mx-auto">
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
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent" />
              </div>
            )}

            <Document
              file={currentDocument.file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Error loading PDF:", error);
                setIsLoading(false);
              }}
              loading={null}
              className="relative z-0"
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={null}
                className="select-text"
                canvasBackground="transparent"
                renderMode="canvas"
                scale={window.innerWidth < 768 ? 1.5 : 1}
              />
            </Document>

            <Canvas
              pageRef={pageRef}
              pageWidth={pageWidth}
              pageNumber={currentPage}
              className="z-10"
            />
          </div>

          {/* Page navigation controls */}
          {numPages && numPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className={`p-2 rounded ${
                  currentPage <= 1
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <p className="text-sm text-gray-700">
                Page {currentPage} of {numPages}
              </p>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= (numPages || 1)}
                className={`p-2 rounded ${
                  currentPage >= (numPages || 1)
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { usePDFStore } from "@/store/store";
import DocumentUploader from "@/Components/DocumentUploader";
import PDFViewerWrapper from "@/Components/PDFViewerWrapper";
import AnnotationToolbar from "@/Components/AnnotationToolbar";

interface HomeProps {}

export default function Home({}: HomeProps) {
  const { currentDocument } = usePDFStore();
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);

  const handleUploadComplete = useCallback(() => {
    setShowAnnotationTools(true);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8" role="main">
      <div className="container mx-auto">
        <header className="mb-6" role="banner">
          <h1
            className="text-3xl font-bold mb-6 text-center text-gray-800"
            aria-label="PDF Signer & Annotator"
          >
            PDF Signer & Annotator
          </h1>
        </header>

        <section
          className="max-w-4xl mx-auto"
          aria-label={currentDocument ? "PDF Viewer" : "Document Upload"}
        >
          {!currentDocument ? (
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg">
              <PDFViewerWrapper />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
("");

"use client";

import { useState } from "react";
import DocumentUploader from "@/Components/DocumentUploader";
import PDFViewerWrapper from "@/Components/PDFViewerWrapper";
// import PDFViewer from "@/Components/PDFViewer";
import AnnotationToolbar from "@/Components/AnnotationToolbar";
import { usePDFStore } from "@/store/store";

export default function Home() {
  const { currentDocument } = usePDFStore();
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            PDF Signer & Annotator
          </h1>
        </header>

        {!currentDocument ? (
          <DocumentUploader
            onUploadComplete={() => setShowAnnotationTools(true)}
          />
        ) : (
          // <div className="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
          <main className="md:col-span-3">
            <PDFViewerWrapper />
          </main>
        )}
      </div>
    </main>
  );
}

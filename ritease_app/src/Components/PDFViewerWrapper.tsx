"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => <div>Loading PDF Viewer</div>
});

export default function PDFViewerWrapper() {
  return <PDFViewer />;
}

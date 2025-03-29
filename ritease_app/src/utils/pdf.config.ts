import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

export function configurePdfJs() {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

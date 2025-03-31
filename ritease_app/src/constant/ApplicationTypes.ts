export type AnnotationType =
  | "highlight"
  | "underline"
  | "signature"
  | "comment";

export interface PDFPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface SignaturePoint {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  position: PDFPosition;
  pageNumber: number;
  comment?: string;
  signaturePoints?: { x: number; y: number }[];
}

export interface PDFDocument {
  file: File;
  name: string;
  url?: string;
}

export interface PDFViewerState {
  numPages: number;
  isLoading: boolean;
  pdfData: Uint8Array | null;
  startPosition: PDFPosition | null;
  isDrawing: boolean;
  annotationColor: string;
  commentText: string;
  showCommentModal: boolean;
  commentPosition: PDFPosition | null;
  signaturePoints: SignaturePoint[];
}

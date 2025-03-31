// Document Types
export interface PDFDocument {
  id: string;
  file: File | Blob;
  name: string;
  url: string;
  pageCount?: number;
  createdAt: Date;
  updatedAt: Date;
  annotations: Annotation[];
}

// Annotation Types
export type AnnotationType =
  | "highlight"
  | "underline"
  | "comment"
  | "signature"
  | "drawing;";

export interface Position {
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
  x: number | undefined;
  y: number;
  width: number | undefined;
  height: number | undefined;
  id: string;
  type: AnnotationType;
  position: Position;
  color: string;
  pageNumber: number;
  text?: string; // For highlights and underlines
  comment?: string; // For comments
  signaturePoints?: Array<{ x: number; y: number }>; // For signatures
  createdAt: Date;
}

// Component Props Types
export interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

export interface CanvasProps {
  pageRef: React.RefObject<HTMLDivElement>;
  pageWidth: number;
  pageNumber: number;
  className?: string;
  // onCommentClick: (x: number, y: number) => void;
}

export interface ToolbarProps {
  className?: string;
}

// State Types
export interface UploadState {
  isProcessing: boolean;
  error: string | null;
}

export interface PDFViewerState {
  numPages: number;
  isLoading: boolean;
  pdfData: Uint8Array | null;
  startPosition: Position | null;
  isDrawing: boolean;
  commentText: string;
  showCommentModal: boolean;
  commentPosition: Position | null;
  signaturePoints: SignaturePoint[];
}

export interface CommentModalState {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  position: Position; // Changed to use Position interface
  initialText?: string;
  maxLength?: number;
}

// Utility Types
export interface CanvasScale {
  width: number;
  height: number;
  scale: number;
}

export interface DocumentOptions {
  cMapUrl: string;
  cMapPacked: boolean;
  workerSrc: string;
}

// Tool Types
import { ElementType } from "react";

export interface AnnotationTool {
  type: AnnotationType;
  label: string;
  icon: ElementType;
  ariaLabel?: string;
  shortcutKey?: string;
}

// Hook Return Types
export interface UseAnnotationReturn {
  isDrawing: boolean;
  startPosition: Position | null;
  signaturePoints: SignaturePoint[];
  handleMouseDown: (
    e: React.MouseEvent<HTMLCanvasElement>,
    pageRef: React.RefObject<HTMLDivElement>
  ) => void;
  handleMouseMove: (
    e: React.MouseEvent<HTMLCanvasElement>,
    pageRef: React.RefObject<HTMLDivElement>
  ) => void;
  handleMouseUp: (
    e: React.MouseEvent<HTMLCanvasElement>,
    pageRef: React.RefObject<HTMLDivElement>
  ) => void;
}

// Operation Types
export interface PDFOperations {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fileData: File | Blob | null;
  loadPDF: () => Promise<void>;
  addAnnotation: (annotation: Annotation) => void;
  color: string;
}

// Export
export interface ExportOptions {
  quality?: number;
  background?: string;
  onProgress?: (progress: number) => void;
}

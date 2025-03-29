export type AnnotationType =
  | "highlight"
  | "underline"
  | "signature"
  | "comment";

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  position: Position;
  pageNumber: number;
  comment?: string;
  signaturePoints?: { x: number; y: number }[];
}

export interface PDFDocument {
  file: File;
  name: string;
  url?: string;
}

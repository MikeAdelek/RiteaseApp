import { create } from "zustand";
import {
  PDFDocument,
  Annotation,
  AnnotationType
} from "@/constant/ApplicationTypes";

interface PDFState {
  currentDocument: PDFDocument | null;
  annotations: Annotation[];
  currentTool: AnnotationType | null;
  selectedAnnotation: string | null;
  setCurrentDocument: (document: PDFDocument) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  setCurrentTool: (tool: AnnotationType | null) => void;
  setSelectedAnnotation: (id: string | null) => void;
  clearAnnotations: () => void;
}

export const usePDFStore = create<PDFState>((set) => ({
  currentDocument: null,
  annotations: [],
  currentTool: null,
  selectedAnnotation: null,

  setCurrentDocument: (document) => set({ currentDocument: document }),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation]
    })),

  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      )
    })),

  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedAnnotation:
        state.selectedAnnotation === id ? null : state.selectedAnnotation
    })),

  setCurrentTool: (tool) => set({ currentTool: tool }),

  setSelectedAnnotation: (id) => set({ selectedAnnotation: id }),

  clearAnnotations: () => set({ annotations: [], selectedAnnotation: null })
}));

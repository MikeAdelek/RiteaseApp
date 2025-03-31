import { create } from "zustand";
import { PDFDocument, Annotation, AnnotationType } from "@/types/types";

interface PDFState {
  currentDocument: PDFDocument | null;
  annotations: Annotation[];
  currentTool: AnnotationType | null;
  selectedAnnotation: string | null;
  color: string;
  error: Error | null;
  isLoading: boolean;
  documentTitle: string;
  // setColor: (color: string) => void;
  setDocumentTitle: (title: string) => void;
  setCurrentDocument: (document: PDFDocument) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  setCurrentTool: (tool: AnnotationType | null) => void;
  setSelectedAnnotation: (id: string | null) => void;
  setAnnotationColor: (color: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearAnnotations: () => void;
}

export const usePDFStore = create<PDFState>((set) => ({
  currentDocument: null,
  annotations: [],
  currentTool: null,
  selectedAnnotation: null,
  color: "#ffff00",
  error: null,
  isLoading: false,
  documentTitle: "",
  setDocumentTitle: (title) => set({ documentTitle: title }),

  setAnnotationColor: (color) => {
    // Convert any oklch colors to hex before storing
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      color = ctx.fillStyle;
    }
    set({ color });
  },
  // Document Actions
  setCurrentDocument: (document: PDFDocument) =>
    set({
      currentDocument: document,
      error: null
    }),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: Error | null) => set({ error, isLoading: false }),

  // Annotation Actions
  addAnnotation: (annotation) => {
    console.log("Adding annotation:", annotation);
    set((state) => ({
      annotations: [...state.annotations, annotation],
      error: null
    }));
  },

  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates, updatedAt: new Date() } : ann
      ),
      error: null
    })),

  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedAnnotation:
        state.selectedAnnotation === id ? null : state.selectedAnnotation,
      error: null
    })),

  setCurrentTool: (tool) => {
    console.log("Setting current tool:", tool);
    set({ currentTool: tool });
  },

  setSelectedAnnotation: (id) => set({ selectedAnnotation: id }),

  // setcolor: (color) => set({ color: color }),

  clearAnnotations: () =>
    set({
      annotations: [],
      selectedAnnotation: null,
      error: null
    })
}));

export const selectAnnotationById = (state: PDFState, id: string) =>
  state.annotations.find((ann) => ann.id === id);

export const selectAnnotationsByPage = (state: PDFState, pageNumber: number) =>
  state.annotations.filter((ann) => ann.pageNumber === pageNumber);

export const selectSelectedAnnotation = (state: PDFState) =>
  state.selectedAnnotation
    ? state.annotations.find((ann) => ann.id === state.selectedAnnotation)
    : null;

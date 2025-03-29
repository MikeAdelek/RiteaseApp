"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { FaSave } from "react-icons/fa";
import { PDFDocument, rgb } from "pdf-lib";
import { usePDFStore } from "@/store/store";
import AnnotationToolbar from "./AnnotationToolbar";
import { Annotation, AnnotationType } from "@/constant/ApplicationTypes";
import { loadPDFData } from "src/helper/loadPDFData";
import {
  drawAnnotation,
  drawCurrentAnnotation,
  hexToRgb
} from "@/utils/annotationUtils";
import CommentModal from "./CommentModal";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const { currentDocument, annotations, currentTool, addAnnotation } =
    usePDFStore();

  // State
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [startPosition, setStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotationColor, setAnnotationColor] = useState("#ffff00");
  const [commentText, setCommentText] = useState<string>("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [signaturePoints, setSignaturePoints] = useState<
    { x: number; y: number }[]
  >([]);

  // Memoize document options
  const documentOptions = useMemo(
    () => ({
      cMapUrl: "cmaps/",
      cMapPacked: true,
      workerSrc: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
    }),
    []
  );

  // Memoize file data
  const fileData = useMemo(
    () =>
      pdfData
        ? new Blob([pdfData], { type: "application/pdf" })
        : currentDocument?.file,
    [pdfData, currentDocument]
  );

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Load PDF data
  useEffect(() => {
    async function loadPDF() {
      if (!currentDocument?.file) return;
      try {
        const data = await loadPDFData(currentDocument.file);
        setPdfData(data);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    }
    loadPDF();
  }, [currentDocument]);

  // Handle canvas setup and annotations
  useEffect(() => {
    if (!isLoading && canvasRef.current && pageRef.current) {
      const canvas = canvasRef.current;
      const page = pageRef.current;
      const rect = page.getBoundingClientRect();
      const scale = rect.width / 800;

      // Set canvas size based on actual page dimensions
      canvas.width = rect.width;
      canvas.height = rect.height;

      const context = canvas.getContext("2d");
      if (context) {
        // Set up context
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.lineCap = "round";
        context.lineJoin = "round";

        // Clear and redraw
        const draw = () => {
          context.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
          annotations.forEach((annotation) => {
            if (annotation.pageNumber === 1) {
              drawAnnotation(annotation, context);
            }
          });
        };

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(draw);
      }
    }
  }, [isLoading, annotations]);

  const onDocumentLoad = useCallback((pdf: any) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool || !pageRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pageRef.current.getBoundingClientRect();
    const scale = rect.width / 800;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (currentTool === "comment") {
      setCommentPosition({ x: e.clientX, y: e.clientY });
      setShowCommentModal(true);
      return;
    }

    setStartPosition({ x, y });
    setIsDrawing(true);

    // Initialize signature points if using signature tool
    if (currentTool === "signature") {
      setSignaturePoints([{ x, y }]);
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !startPosition || !currentTool || !canvasRef.current)
        return;
      e.preventDefault();
      e.stopPropagation();

      const rect = pageRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scale = rect.width / 800;
      const currentX = (e.clientX - rect.left) / scale;
      const currentY = (e.clientY - rect.top) / scale;

      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      requestAnimationFrame(() => {
        if (!context || !canvasRef.current) return;

        context.clearRect(
          0,
          0,
          canvasRef.current.width / scale,
          canvasRef.current.height / scale
        );

        // Draw existing annotations
        annotations.forEach((annotation) => {
          if (annotation.pageNumber === 1) {
            drawAnnotation(annotation, context);
          }
        });

        // Draw current annotation
        if (currentTool === "signature") {
          // Add new point to signature
          setSignaturePoints((prev) => [...prev, { x: currentX, y: currentY }]);

          // Draw signature path
          context.beginPath();
          context.moveTo(signaturePoints[0].x, signaturePoints[0].y);
          signaturePoints.forEach((point, i) => {
            if (i > 0) {
              const xc = (point.x + signaturePoints[i - 1].x) / 2;
              const yc = (point.y + signaturePoints[i - 1].y) / 2;
              context.quadraticCurveTo(
                signaturePoints[i - 1].x,
                signaturePoints[i - 1].y,
                xc,
                yc
              );
            }
          });
          context.strokeStyle = annotationColor;
          context.lineWidth = 2;
          context.lineCap = "round";
          context.lineJoin = "round";
          context.stroke();
        } else {
          drawCurrentAnnotation(
            context,
            startPosition,
            {
              x: currentX,
              y:
                currentTool === "highlight" || currentTool === "underline"
                  ? startPosition.y
                  : currentY
            },
            currentTool,
            annotationColor
          );
        }
      });
    },
    [
      isDrawing,
      startPosition,
      currentTool,
      annotations,
      annotationColor,
      signaturePoints
    ]
  );

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPosition || !currentTool) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scale = rect.width / 800;
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;

    if (currentTool === "signature" && signaturePoints.length > 0) {
      // Calculate bounding box of signature
      const minX = Math.min(...signaturePoints.map((p) => p.x));
      const maxX = Math.max(...signaturePoints.map((p) => p.x));
      const minY = Math.min(...signaturePoints.map((p) => p.y));
      const maxY = Math.max(...signaturePoints.map((p) => p.y));

      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "signature",
        color: annotationColor,
        position: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        },
        pageNumber: 1,
        signaturePoints: signaturePoints.map((p) => ({
          x: p.x - minX,
          y: p.y - minY
        })) // Store relative points
      };

      addAnnotation(newAnnotation);
      setSignaturePoints([]);
    } else {
      // Handle other annotation types
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: currentTool,
        color: annotationColor,
        position: {
          x: startPosition.x,
          y:
            currentTool === "highlight" || currentTool === "underline"
              ? startPosition.y
              : endY,
          width: endX - startPosition.x,
          height:
            currentTool === "highlight" || currentTool === "underline"
              ? 20
              : endY - startPosition.y
        },
        pageNumber: 1
      };

      addAnnotation(newAnnotation);
    }

    setIsDrawing(false);
    setStartPosition(null);
  };

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAnnotationColor(e.target.value);
    },
    []
  );

  const handleCommentSave = useCallback(
    (text: string) => {
      if (!commentPosition || !pageRef.current) return;

      const rect = pageRef.current.getBoundingClientRect();
      const scale = rect.width / 800;
      const x = (commentPosition.x - rect.left) / scale;
      const y = (commentPosition.y - rect.top) / scale;

      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "comment" as AnnotationType,
        color: annotationColor,
        position: {
          x,
          y,
          width: 20,
          height: 20
        },
        pageNumber: 1,
        comment: text
      };

      addAnnotation(newAnnotation);
      setShowCommentModal(false);
      setCommentPosition(null);
    },
    [commentPosition, annotationColor, addAnnotation]
  );

  const exportPDF = async () => {
    if (!currentDocument?.file) return;

    try {
      // Load the PDF document
      const data = await loadPDFData(currentDocument.file);
      const pdfDoc = await PDFDocument.load(data);
      const pages = pdfDoc.getPages();
      const page = pages[0];

      // Draw all annotations
      annotations.forEach((annotation) => {
        if (annotation.pageNumber === 1) {
          const { r, g, b } = hexToRgb(annotation.color) || {
            r: 1,
            g: 1,
            b: 0
          };

          switch (annotation.type) {
            case "highlight":
              page.drawRectangle({
                x: annotation.position.x,
                y: page.getHeight() - annotation.position.y,
                width: annotation.position.width,
                height: 20,
                color: rgb(r, g, b),
                opacity: 0.5
              });
              break;
            case "underline":
              page.drawLine({
                start: {
                  x: annotation.position.x,
                  y: page.getHeight() - annotation.position.y
                },
                end: {
                  x: annotation.position.x + annotation.position.width,
                  y: page.getHeight() - annotation.position.y
                },
                color: rgb(r, g, b),
                thickness: 2
              });
              break;
            case "signature":
              page.drawLine({
                start: {
                  x: annotation.position.x,
                  y: page.getHeight() - annotation.position.y
                },
                end: {
                  x: annotation.position.x + annotation.position.width,
                  y:
                    page.getHeight() -
                    (annotation.position.y + annotation.position.height)
                },
                color: rgb(r, g, b),
                thickness: 2
              });
              break;
          }
        }
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `annotated-${currentDocument.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <div className="flex items-center">
          <AnnotationToolbar />
          <input
            type="color"
            value={annotationColor}
            onChange={handleColorChange}
            className="ml-4"
            aria-label="Annotation color"
          />
        </div>
        <button
          type="button"
          onClick={exportPDF}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaSave className="mr-2" />
          Export Document
        </button>
      </div>

      <div className="flex-grow flex justify-center items-center p-4">
        {currentDocument && (
          <div ref={pageRef} className="relative bg-white shadow-lg">
            <Document
              file={fileData}
              onLoadSuccess={onDocumentLoad}
              loading={<div className="p-4">Loading PDF...</div>}
              options={documentOptions}
            >
              <Page
                pageNumber={1}
                width={800}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className={`select-text ${
                  currentTool ? "pointer-events-none" : ""
                }`}
                loading={<div className="p-4">Loading page...</div>}
              />
              {currentTool && (
                <canvas
                  className="absolute inset-0 z-10"
                  ref={canvasRef}
                  style={{
                    cursor:
                      currentTool === "signature"
                        ? "crosshair"
                        : currentTool === "highlight" ||
                          currentTool === "underline"
                        ? "text"
                        : "default",
                    pointerEvents: "auto",
                    width: "100%",
                    height: "100%",
                    imageRendering: "pixelated"
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              )}
            </Document>
            {showCommentModal && commentPosition && (
              <CommentModal
                isOpen={showCommentModal}
                position={commentPosition}
                onSave={handleCommentSave}
                onClose={() => {
                  setShowCommentModal(false);
                  setCommentPosition(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

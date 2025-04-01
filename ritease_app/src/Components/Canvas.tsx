import { useEffect, useRef, useState } from "react";
import { usePDFStore } from "@/store/store";
import { useAnnotation } from "@/hooks/useAnnotations";
import { drawAnnotation, drawCurrentAnnotation } from "@/utils/annotationUtils";
import { cn } from "@/utils/classNames";
import { Position, Annotation } from "@/types/types";

export default function Canvas({
  pageRef,
  pageWidth,
  pageNumber,
  className
}: {
  pageRef: React.RefObject<HTMLDivElement>;
  pageWidth: number;
  pageNumber: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTool, annotations, color, addAnnotation } = usePDFStore();
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<Position[]>([]);

  const collectSignaturePoints = () => {
    const points: Position[] = [];
    // Collect all points between start and current position
    if (startPosition && currentPosition) {
      points.push({ x: 0, y: 0, width: 0, height: 0 }); // relative to start position
      points.push({
        x: currentPosition.x - startPosition.x,
        y: currentPosition.y - startPosition.y,
        width: 0,
        height: 0
      });
    }
    return points;
  };

  // Initialize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageRef.current) return;

    const updateCanvasSize = () => {
      const pageElement = pageRef.current;
      if (!pageElement) return;

      // Get the actual dimensions of the PDF page
      const pdfPage = pageElement.querySelector(".react-pdf__Page");
      if (pdfPage) {
        // Set canvas dimensions to match the PDF page exactly
        canvas.width = pdfPage.clientWidth;
        canvas.height = pdfPage.clientHeight;
      } else {
        // Fallback if PDF page element not found
        canvas.width = pageElement.clientWidth;
        canvas.height = pageElement.clientHeight;
      }

      // Redraw existing annotations after resize
      const context = canvas.getContext("2d");
      if (context && annotations) {
        // Clear the canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw all annotations
        annotations.forEach((annotation) =>
          drawAnnotation(annotation, context)
        );
      }
    };

    // Initial update and add resize listener
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [pageRef, annotations]);

  const [isNewStroke, setIsNewStroke] = useState(true);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 0,
      height: 0
    };

    setStartPosition(position);
    setIsDrawing(true);

    if (currentTool === "signature") {
      // Clear previous signature points when starting a new signature
      setSignaturePoints([
        {
          x: position.x,
          y: position.y,
          width: 0,
          height: 0
        }
      ]);

      const context = canvas.getContext("2d");
      if (context) {
        // Start a new path for the signature
        context.beginPath();
        context.moveTo(position.x, position.y);
      }
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPosition || !currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 0,
      height: 0
    };

    if (currentTool === "signature") {
      // If this is a new stroke, we've already added the first point in mouseDown
      if (isNewStroke) {
        setIsNewStroke(false);
      } else {
        // Add this point to the signature points
        setSignaturePoints((prev) => [
          ...prev,
          { x: position.x, y: position.y, width: 0, height: 0 }
        ]);
      }

      // Draw the current stroke
      context.lineTo(position.x, position.y);
      context.strokeStyle = color || "#000000";
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      // Don't begin a new path here - that would disconnect the current line
    } else if (currentTool === "comment") {
      // Handle comment box preview
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.rect(
        startPosition.x,
        startPosition.y,
        position.x - startPosition.x,
        100 // Fixed height for comment box
      );
      context.strokeStyle = color || "#000000";
      context.stroke();
    } else {
      // For other tools, clear and redraw
      context.clearRect(0, 0, canvas.width, canvas.height);
      annotations?.forEach((annotation) => drawAnnotation(annotation, context));

      // Draw the current annotation
      drawCurrentAnnotation(
        context,
        startPosition,
        position,
        currentTool,
        color || "#ffff00"
      );
    }

    setCurrentPosition(position);
  };
  const handleMouseUp = () => {
    if (!isDrawing || !startPosition || !currentTool || !currentPosition)
      return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate width and height
    const width = Math.abs(currentPosition.x - startPosition.x);
    const height =
      currentTool === "comment"
        ? 100
        : Math.abs(currentPosition.y - startPosition.y);

    // For signature, use the bounding box of all points
    let signatureBounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };

    if (currentTool === "signature" && signaturePoints.length > 0) {
      // Calculate the bounding box of the signature
      for (const point of signaturePoints) {
        signatureBounds.minX = Math.min(signatureBounds.minX, point.x);
        signatureBounds.minY = Math.min(signatureBounds.minY, point.y);
        signatureBounds.maxX = Math.max(signatureBounds.maxX, point.x);
        signatureBounds.maxY = Math.max(signatureBounds.maxY, point.y);
      }
    }

    // Create annotation with position object only
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      type: currentTool,
      position: {
        x: currentTool === "signature" ? signatureBounds.minX : startPosition.x,
        y: currentTool === "signature" ? signatureBounds.minY : startPosition.y,
        width:
          currentTool === "signature"
            ? signatureBounds.maxX - signatureBounds.minX
            : width,
        height:
          currentTool === "signature"
            ? signatureBounds.maxY - signatureBounds.minY
            : height
      },
      color: color || "#000000",
      pageNumber,
      createdAt: new Date()
    };

    if (currentTool === "signature") {
      // Make sure we have signature points
      if (signaturePoints.length > 0) {
        // Store the signature points relative to the signature's top-left corner
        annotation.signaturePoints = signaturePoints.map((point) => ({
          x: point.x - signatureBounds.minX,
          y: point.y - signatureBounds.minY
        }));

        console.log("Adding signature annotation with points:", annotation);
        addAnnotation(annotation);
      }
    } else if (currentTool === "comment") {
      annotation.text = "";
      // Create textarea for comment input
      const textarea = document.createElement("textarea");
      textarea.style.position = "absolute";
      textarea.style.left = `${startPosition.x}px`;
      textarea.style.top = `${startPosition.y}px`;
      textarea.style.width = `${annotation.position.width}px`;
      textarea.style.height = `${annotation.position.height}px`;
      textarea.style.zIndex = "1000";

      textarea.onblur = () => {
        annotation.text = textarea.value;
        addAnnotation(annotation);
        textarea.remove();
      };

      canvas.parentElement?.appendChild(textarea);
      textarea.focus();
    } else {
      addAnnotation(annotation);
    }

    setIsDrawing(false);
    setStartPosition(null);
    setCurrentPosition(null);
    setSignaturePoints([]);
  };
  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn("absolute top-0 left-0 w-full h-full", className)}
      style={{
        pointerEvents: currentTool ? "auto" : "none",
        zIndex: 10,
        cursor: currentTool ? "crosshair" : "default"
      }}
    />
  );
}

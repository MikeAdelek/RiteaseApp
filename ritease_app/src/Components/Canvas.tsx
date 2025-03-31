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
      points.push({ x: 0, y: 0 }); // relative to start position
      points.push({
        x: currentPosition.x - startPosition.x,
        y: currentPosition.y - startPosition.y
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

      canvas.width = pageElement.clientWidth;
      canvas.height = pageElement.clientHeight;

      // Redraw existing annotations after resize
      const context = canvas.getContext("2d");
      if (context && annotations) {
        annotations.forEach((annotation) =>
          drawAnnotation(annotation, context)
        );
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [pageRef, annotations]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setStartPosition(position);
    setIsDrawing(true);
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
      y: e.clientY - rect.top
    };

    if (currentTool === "signature") {
      // Store each point for the signature
      setSignaturePoints((prev) => [...prev, position]);

      // Draw the current stroke
      context.lineTo(position.x, position.y);
      context.strokeStyle = color || "#000000";
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
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

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      type: currentTool,
      position: {
        x: startPosition.x,
        y: startPosition.y,
        width: Math.abs(currentPosition.x - startPosition.x),
        height:
          currentTool === "comment"
            ? 100
            : Math.abs(currentPosition.y - startPosition.y)
      },
      color: color || "#000000",
      pageNumber,
      createdAt: new Date()
    };

    if (currentTool === "signature") {
      annotation.signaturePoints = signaturePoints;
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

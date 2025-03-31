import { useState, useCallback, RefObject } from "react";
import { usePDFStore } from "@/store/store";
import { Position } from "@/types/types";
import { drawCurrentAnnotation } from "@/utils/annotationUtils";

export const useAnnotation = (
  canvasRef: RefObject<HTMLCanvasElement>,
  pageWidth: number,
  pageNumber: number
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const { currentTool, color, addAnnotation } = usePDFStore();

  const startDrawing = useCallback((position: Position) => {
    setIsDrawing(true);
    setStartPosition(position);
  }, []);

  const draw = useCallback(
    (currentPosition: Position) => {
      if (!isDrawing || !startPosition || !currentTool) return;

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!context) return;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw current annotation
      drawCurrentAnnotation(
        context,
        startPosition,
        currentPosition,
        currentTool,
        color
      );
    },
    [isDrawing, startPosition, currentTool, color]
  );

  return { isDrawing, startDrawing, draw };
};

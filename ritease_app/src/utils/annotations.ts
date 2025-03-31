import { Annotation, AnnotationType, Position } from "@/types/types";
import { rgb } from "pdf-lib";

interface Point {
  x: number;
  y: number;
}

const getAnnotationDimensions = (position: Position) => ({
  width: position.width || 0,
  height: position.height || 20
});

export const drawAnnotation = (
  annotation: Annotation,
  context: CanvasRenderingContext2D | null
) => {
  if (!context) return;

  const { width, height } = getAnnotationDimensions(annotation.position);

  switch (annotation.type) {
    case "highlight":
      context.fillStyle = `${annotation.color}80`;
      context.fillRect(
        annotation.position.x,
        annotation.position.y - 15,
        width,
        height
      );
      break;

    case "underline":
      context.beginPath();
      context.moveTo(annotation.position.x, annotation.position.y);
      context.lineTo(annotation.position.x + width, annotation.position.y);
      context.strokeStyle = annotation.color;
      context.lineWidth = 2;
      context.stroke();
      break;

    case "signature":
      if (annotation.signaturePoints && annotation.signaturePoints.length > 0) {
        const { signaturePoints } = annotation;
        context.beginPath();
        context.moveTo(
          annotation.position.x + signaturePoints[0].x,
          annotation.position.y + signaturePoints[0].y
        );
        signaturePoints.forEach((point, i) => {
          if (i > 0) {
            const xc = (point.x + signaturePoints[i - 1].x) / 2;
            const yc = (point.y + signaturePoints[i - 1].y) / 2;
            context.quadraticCurveTo(
              annotation.position.x + signaturePoints[i - 1].x,
              annotation.position.y + signaturePoints[i - 1].y,
              annotation.position.x + xc,
              annotation.position.y + yc
            );
          }
        });
        context.strokeStyle = annotation.color;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      }
      break;

    case "comment":
      drawCommentAnnotation(context, annotation);
      break;
  }
};

const drawCommentAnnotation = (
  context: CanvasRenderingContext2D,
  annotation: Annotation
) => {
  // Draw comment icon
  context.fillStyle = annotation.color;
  context.beginPath();
  context.arc(annotation.position.x, annotation.position.y, 10, 0, 2 * Math.PI);
  context.fill();

  // Draw comment text if present
  if (annotation.comment) {
    context.font = "12px Arial";
    context.fillStyle = "#000000";
    context.fillText(
      annotation.comment,
      annotation.position.x + 15,
      annotation.position.y + 5
    );
  }
};

export const drawCurrentAnnotation = (
  context: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  tool: AnnotationType,
  color: string
) => {
  if (!context) return;

  const width = Math.abs(current.x - start.x);
  const startX = Math.min(start.x, current.x);

  switch (tool) {
    case "highlight":
      context.fillStyle = `${color}80`;
      context.fillRect(startX, start.y - 10, width, 20);
      break;

    case "underline":
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(current.x, start.y);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      break;

    case "signature":
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(current.x, current.y);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      break;
  }
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      }
    : null;
};

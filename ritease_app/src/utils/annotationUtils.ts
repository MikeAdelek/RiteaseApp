import { Annotation, Position } from "@/types/types";

export const drawAnnotation = (
  annotation: Annotation,
  context: CanvasRenderingContext2D | null
) => {
  if (!context) return;

  context.save();

  try {
    switch (annotation.type) {
      case "highlight":
        context.fillStyle = `${annotation.color}80`; // 50% opacity
        context.fillRect(
          annotation.position.x,
          annotation.position.y - 15,
          annotation.position.width || 0,
          20
        );
        break;

      case "underline":
        context.beginPath();
        context.moveTo(annotation.position.x, annotation.position.y);
        context.lineTo(
          annotation.position.x + (annotation.position.width || 0),
          annotation.position.y
        );
        context.strokeStyle = annotation.color;
        context.lineWidth = 2;
        context.stroke();
        break;

      case "comment":
        // Draw comment box
        context.beginPath();
        context.rect(
          annotation.position.x,
          annotation.position.y,
          annotation.position.width || 0,
          annotation.position.height || 0
        );
        context.strokeStyle = annotation.color;
        context.stroke();

        // Draw comment text
        if (annotation.text) {
          context.font = "14px Arial";
          context.fillStyle = "#000000";
          context.fillText(
            annotation.text,
            annotation.position.x + 5,
            annotation.position.y + 20,
            (annotation.position.width || 0) - 10
          );
        }
        break;

      case "signature":
        if (
          annotation.signaturePoints &&
          annotation.signaturePoints.length > 0
        ) {
          context.beginPath();
          context.moveTo(
            annotation.signaturePoints[0].x,
            annotation.signaturePoints[0].y
          );

          annotation.signaturePoints.forEach((point) => {
            context.lineTo(point.x, point.y);
          });

          context.strokeStyle = annotation.color;
          context.lineWidth = 2;
          context.lineCap = "round";
          context.lineJoin = "round";
          context.stroke();
        }
        break;
    }
  } finally {
    context.restore();
  }
};

export const drawCurrentAnnotation = (
  context: CanvasRenderingContext2D,
  startPosition: Position,
  currentPosition: Position,
  tool: string,
  color: string
) => {
  console.log("Drawing current annotation:", {
    tool,
    startPosition,
    currentPosition,
    color,
    contextExists: !!context
  });

  // Save the current context state
  context.save();

  try {
    const width = Math.abs(currentPosition.x - startPosition.x);
    const height = Math.abs(currentPosition.y - startPosition.y);

    switch (tool) {
      case "highlight":
        context.fillStyle = `${color}80`;
        context.fillRect(
          Math.min(startPosition.x, currentPosition.x),
          startPosition.y - 15,
          width,
          20
        );
        break;

      case "underline":
        context.beginPath();
        context.moveTo(startPosition.x, startPosition.y);
        context.lineTo(currentPosition.x, startPosition.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        break;

      case "signature":
        context.beginPath();
        context.moveTo(startPosition.x, startPosition.y);
        context.lineTo(currentPosition.x, currentPosition.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
        break;
    }
  } catch (error) {
    console.error("Error drawing current annotation:", error);
  } finally {
    // Restore the context state
    context.restore();
  }
};

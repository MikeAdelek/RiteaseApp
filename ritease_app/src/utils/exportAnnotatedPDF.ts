import { PDFDocument as PDFLib, rgb, StandardFonts } from "pdf-lib";
import { Annotation, AnnotationType } from "@/types/types";
import { PDFDocument } from "@/types/types";

/**
 * Exports the current document with all annotations and signatures embedded
 * @param currentDocument The current PDF document being viewed/edited
 * @param annotations Array of all annotations to be applied to the document
 */
export const exportAnnotatedPDF = async (
  currentDocument: PDFDocument | null,
  annotations: Annotation[]
): Promise<void> => {
  if (!currentDocument) return;

  try {
    // Load the existing PDF document
    const existingPdfBytes = await currentDocument.file.arrayBuffer();
    const pdfDoc = await PDFLib.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Process each annotation and apply it to the PDF
    for (const annotation of annotations) {
      // Skip annotation if required properties are undefined
      if (
        !annotation.position ||
        annotation.position.width === undefined ||
        annotation.position.height === undefined
      ) {
        continue;
      }

      // Get the page based on pageNumber (ensure it's within range)
      const pageIndex = Math.min(
        Math.max(0, annotation.pageNumber - 1),
        pages.length - 1
      );
      const page = pages[pageIndex];
      const pageHeight = page.getHeight();
      const pageWidth = page.getWidth();

      // Calculate scaling factor between canvas and PDF coordinates
      const canvasWidth = 800; // Default width, adjust if needed
      const scaleX = pageWidth / canvasWidth;
      const scaleY = scaleX; // Maintain aspect ratio

      switch (annotation.type) {
        case "highlight":
          // Apply highlight annotation
          page.drawRectangle({
            x: annotation.position.x * scaleX,
            y:
              pageHeight -
              (annotation.position.y + annotation.position.height) * scaleY,
            width: annotation.position.width * scaleX,
            height: annotation.position.height * scaleY,
            color: hexToRgb(annotation.color || "#FFFF00"),
            opacity: 0.3
          });
          break;

        case "underline":
          // Apply underline annotation
          page.drawLine({
            start: {
              x: annotation.position.x * scaleX,
              y:
                pageHeight -
                (annotation.position.y + annotation.position.height) * scaleY
            },
            end: {
              x: (annotation.position.x + annotation.position.width) * scaleX,
              y:
                pageHeight -
                (annotation.position.y + annotation.position.height) * scaleY
            },
            thickness: 1 * scaleY,
            color: hexToRgb(annotation.color || "#000000")
          });
          break;

        case "comment":
          // Apply comment annotation
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawRectangle({
            x: annotation.position.x * scaleX,
            y:
              pageHeight -
              (annotation.position.y + annotation.position.height) * scaleY,
            width: annotation.position.width * scaleX,
            height: annotation.position.height * scaleY,
            color: hexToRgb("#FFFFCC"),
            borderColor: hexToRgb("#CCCCCC"),
            borderWidth: 1 * scaleX,
            opacity: 0.8
          });

          // Draw comment text if available
          if (annotation.text) {
            page.drawText(annotation.text, {
              x: (annotation.position.x + 5) * scaleX,
              y: pageHeight - (annotation.position.y + 15) * scaleY,
              size: 10 * scaleY,
              font: font,
              color: hexToRgb("#000000")
            });
          }
          break;

        case "signature":
          // Debug logging to check if we're entering this case
          console.log("Processing signature annotation:", annotation);

          // Check if signaturePoints exist and are valid
          if (
            annotation.signaturePoints &&
            annotation.signaturePoints.length > 0
          ) {
            console.log(
              "Signature points found:",
              annotation.signaturePoints.length
            );

            // Draw each point as a connected line
            let isFirstPoint = true;
            let lastX = 0,
              lastY = 0;

            for (const point of annotation.signaturePoints) {
              // Skip invalid points
              if (
                !point ||
                typeof point.x !== "number" ||
                typeof point.y !== "number"
              ) {
                console.log("Skipping invalid point:", point);
                continue;
              }

              // Calculate the absolute position in PDF coordinates
              const x = (annotation.position.x + point.x) * scaleX;
              const y = pageHeight - (annotation.position.y + point.y) * scaleY;

              if (isFirstPoint) {
                // For the first point, just store its position
                isFirstPoint = false;
              } else {
                // For subsequent points, draw a line from the last point
                page.drawLine({
                  start: { x: lastX, y: lastY },
                  end: { x, y },
                  thickness: 2 * scaleY,
                  color: hexToRgb(annotation.color || "#000000")
                });
              }

              // Update the last point
              lastX = x;
              lastY = y;
            }
          } else {
            console.log(
              "No signature points found for annotation:",
              annotation
            );
          }
          break;
      }
    }

    // Generate the final PDF
    const pdfBytes = await pdfDoc.save();

    // Create and download the file
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `annotated-${currentDocument.name}`;
    link.click();

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error("Error in exportAnnotatedPDF:", error);
  }
};

/**
 * Utility function to convert hex color string to RGB
 */
const hexToRgb = (hex: string) => {
  // Remove the # if present
  hex = hex.replace("#", "");

  // Handle shorthand hex format (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Parse the hex values to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return rgb(r, g, b);
};

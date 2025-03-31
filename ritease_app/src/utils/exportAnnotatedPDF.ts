import { PDFDocument as PDFLib, rgb, StandardFonts } from "pdf-lib";
import { Annotation, AnnotationType } from "@/types/types";
import { PDFDocument } from "@/types/types";

/**
 * Exports the current document with all annotations and signatures embedded
 * @param currentDocument The current PDF document being viewed/edited
 * @param annotations Array of all annotations to be applied to the document
 */
export const exportAnnotatedPDF = async (
  currentDocument: PDFDocument | null
): Promise<void> => {
  if (!currentDocument) return;

  try {
    // Load the existing PDF document
    const existingPdfBytes = await currentDocument.file.arrayBuffer();
    const pdfDoc = await PDFLib.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Get annotations from the document
    const annotations = currentDocument.annotations;

    // Process each annotation and apply it to the PDF
    for (const annotation of annotations) {
      // Skip annotation if required properties are undefined
      if (
        annotation.x === undefined ||
        annotation.width === undefined ||
        annotation.height === undefined
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

      // Convert y-coordinate (PDF uses bottom-left origin)
      const y = pageHeight - annotation.y - annotation.height;

      switch (annotation.type) {
        case "highlight":
          // Apply highlight annotation
          page.drawRectangle({
            x: annotation.x,
            y: y,
            width: annotation.width,
            height: annotation.height,
            color: hexToRgb(annotation.color || "#FFFF00"),
            opacity: 0.3
          });
          break;

        case "underline":
          // Apply underline annotation
          page.drawLine({
            start: { x: annotation.x, y: y },
            end: { x: annotation.x + annotation.width, y: y },
            thickness: 1,
            color: hexToRgb(annotation.color || "#000000")
          });
          break;

        case "comment":
          // Apply comment annotation
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawRectangle({
            x: annotation.x,
            y: y,
            width: annotation.width,
            height: annotation.height,
            color: hexToRgb("#FFFFCC"),
            borderColor: hexToRgb("#CCCCCC"),
            borderWidth: 1,
            opacity: 0.8
          });

          // Draw comment text if available
          if (annotation.comment) {
            page.drawText(annotation.comment, {
              x: annotation.x + 5,
              y: y + annotation.height - 15,
              size: 10,
              font: font,
              color: hexToRgb("#000000")
            });
          }
          break;

        case "signature":
          // Apply signature by drawing the points
          if (
            annotation.signaturePoints &&
            annotation.signaturePoints.length > 1
          ) {
            // Draw the signature by connecting points
            for (let i = 0; i < annotation.signaturePoints.length - 1; i++) {
              const point = annotation.signaturePoints[i];
              const nextPoint = annotation.signaturePoints[i + 1];

              page.drawLine({
                start: {
                  x: annotation.x + point.x,
                  y: pageHeight - annotation.y - point.y
                },
                end: {
                  x: annotation.x + nextPoint.x,
                  y: pageHeight - annotation.y - nextPoint.y
                },
                thickness: 1.5,
                color: hexToRgb(annotation.color || "#000000")
              });
            }
          }
          break;

        // case "drawing":
        //   // Similar to signature, but might have different styling
        //   if (
        //     annotation.signaturePoints &&
        //     annotation.signaturePoints.length > 1
        //   ) {
        //     for (let i = 0; i < annotation.signaturePoints.length - 1; i++) {
        //       const point = annotation.signaturePoints[i];
        //       const nextPoint = annotation.signaturePoints[i + 1];

        //       page.drawLine({
        //         start: {
        //           x: annotation.x + point.x,
        //           y: pageHeight - annotation.y - point.y
        //         },
        //         end: {
        //           x: annotation.x + nextPoint.x,
        //           y: pageHeight - annotation.y - nextPoint.y
        //         },
        //         thickness: 2,
        //         color: hexToRgb(annotation.color || "#000000")
        //       });
        //     }
        //   }
        //   break;
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

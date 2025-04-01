import { useState, FC, MouseEvent } from "react";
import { usePDFStore } from "@/store/store";
import { exportAnnotatedPDF } from "@/utils/exportAnnotatedPDF";
import { PDFDocument } from "@/types/types"; // Import your PDFDocument interface

export const ExportButton: FC = () => {
  const { currentDocument, annotations } = usePDFStore();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const hasAnnotations = annotations.length > 0;
  const isDisabled = !currentDocument || !hasAnnotations || isExporting;

  const handleExport = async (
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    if (isDisabled || !currentDocument) return;

    try {
      setIsExporting(true);

      // Debug: Check annotations before export
      console.log("Exporting annotations:", annotations);

      // Check specifically for signature annotations
      const signatureAnnotations = annotations.filter(
        (a) => a.type === "signature"
      );
      console.log("Signature annotations:", signatureAnnotations);

      await exportAnnotatedPDF(currentDocument, annotations);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTooltipMessage = (): string => {
    if (!currentDocument) return "Open a document first";
    if (!hasAnnotations) return "Add annotations before exporting";
    return "Export annotated PDF";
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleExport}
        disabled={isDisabled}
        className={`flex items-center gap-2 px-3 py-1 text-sm rounded border ${
          isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-800 hover:bg-gray-50 active:bg-gray-100"
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Export PDF"
        type="button"
      >
        {/* Simple download icon using SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg whitespace-nowrap z-10"
          role="tooltip"
        >
          {getTooltipMessage()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

import { FaHighlighter, FaPen, FaSignature, FaRegComment } from "react-icons/fa";
import { AnnotationTool } from "@/types/types";

export const ANNOTATION_TOOLS: AnnotationTool[] = [
  {
    type: "highlight",
    label: "Highlight",
    icon: FaHighlighter,
    ariaLabel: "Highlight text",
    shortcutKey: "H"
  },
  {
    type: "underline",
    label: "Underline",
    icon: FaPen,
    ariaLabel: "Underline text",
    shortcutKey: "U"
  },
  {
    type: "comment",
    label: "Comment",
    icon: FaRegComment,
    ariaLabel: "Add comment",
    shortcutKey: "C"
  },
  {
    type: "signature",
    label: "Signature",
    icon: FaSignature,
    ariaLabel: "Add signature",
    shortcutKey: "S"
  }
] as const;
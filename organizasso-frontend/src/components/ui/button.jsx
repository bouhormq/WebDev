import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

// Helper function to generate styles based on variants
// NOTE: This is a simplified approximation. Hover, focus, disabled, dark mode,
//       and complex selectors ([&_svg], has-[>svg], aria-invalid) are LOST.
const getButtonStyles = ({ variant, size }) => {
  // Base styles (approximated from cva)
  let styles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem", // from gap-2 (default)
    whiteSpace: "nowrap",
    borderRadius: "0.5rem", // from rounded-lg (default)
    fontSize: "0.875rem", // from text-sm
    fontWeight: "500", // from font-medium
    transition: "all 0.2s ease-in-out", // Approximated from transition-all
    outline: "none",
    flexShrink: 0, // from shrink-0
    // pointerEvents: 'none', // Cannot apply conditional styles like disabled:pointer-events-none
    // opacity: 0.5, // Cannot apply conditional styles like disabled:opacity-50
  };

  // Variant styles
  switch (variant) {
    case "destructive":
      styles = {
        ...styles,
        backgroundColor: "var(--destructive)",
        color: "var(--destructive-foreground)", // Assuming white is foreground
      };
      break;
    case "destructiveOutline":
      styles = {
        ...styles,
        border: "1px solid var(--destructive)",
        color: "var(--destructive)",
        backgroundColor: "transparent",
      };
      break;
    case "outline":
      styles = {
        ...styles,
        border: "1px solid var(--border)",
        backgroundColor: "var(--background)",
      };
      break;
    case "success":
      styles = { ...styles, backgroundColor: "var(--success)", color: "white" }; // Assuming var(--success) exists
      break;
    case "successOutline":
      styles = { ...styles, border: "1px solid var(--success)", color: "var(--success)", backgroundColor: "transparent" };
      break;
    case "secondary":
      styles = { ...styles, backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" };
      break;
    case "ghost":
       styles = { ...styles, backgroundColor: "transparent", color: "var(--foreground)" }; // Color needs context
      break;
    case "link":
      styles = {
        ...styles,
        color: "var(--primary)",
        textDecoration: "underline", // Approximated
        textUnderlineOffset: "4px",
        backgroundColor: "transparent",
      };
      break;
    case "default":
    default:
      styles = { ...styles, backgroundColor: "var(--primary)", color: "var(--primary-foreground)" };
      break;
  }

  // Size styles
  switch (size) {
    case "sm":
      styles = {
        ...styles,
        height: "2.25rem", // h-9
        borderRadius: "0.375rem", // rounded-md
        padding: "0 0.75rem", // px-3
        gap: "0.375rem", // gap-1.5
      };
      break;
    case "lg":
      styles = {
        ...styles,
        height: "2.75rem", // h-11
        borderRadius: "0.5rem", // rounded-lg
        padding: "0 1.5rem", // px-6
      };
      break;
    case "icon":
      styles = {
        ...styles,
        height: "2.5rem", // size-10
        width: "2.5rem",  // size-10
        padding: 0, // Icon buttons typically have no padding
      };
      break;
    case "default":
    default:
      styles = {
        ...styles,
        height: "2.5rem", // h-10
        padding: "0.5rem 1rem", // py-2 px-4 (approximated)
      };
      break;
  }

  return styles;
};

function Button({
  className,
  variant = "default", // Provide defaults
  size = "default", // Provide defaults
  asChild = false,
  style, // Accept incoming style prop
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const combinedStyle = { ...getButtonStyles({ variant, size }), ...style }

  return (
    <Comp
      data-slot="button"
      style={combinedStyle} // Apply calculated inline styles
      className={className} // Keep external className
      {...props} />
  );
}

// Exporting getButtonStyles might be useful if variant logic is needed elsewhere
export { Button, getButtonStyles }

import * as React from "react"

// Helper function for Alert variants
// NOTE: Complex grid layout based on children (has:[>svg]),
//       SVG styling ([&>svg]), and child description styling
//       based on variant (*:data-[slot=...]) are LOST.
const getAlertStyles = ({ variant }) => {
  let styles = {
    position: "relative",
    width: "100%",
    borderRadius: "0.5rem", // rounded-lg
    border: "1px solid var(--border)", // border
    padding: "0.75rem 1rem", // px-4 py-3
    fontSize: "0.875rem", // text-sm
    display: "grid", // Base grid
    // gridTemplateColumns: "...", // Complex logic lost
    // gap: "...", // Complex logic lost
    alignItems: "start", // items-start
  };

  switch (variant) {
    case "destructive":
      styles = {
        ...styles,
        color: "var(--destructive)",
        // backgroundColor: "var(--card)", // Assuming default bg
        // SVG/description text color rules lost
      };
      break;
    case "default":
    default:
      styles = {
        ...styles,
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      };
      break;
  }
  return styles;
};

function Alert({
  className,
  variant = "default", // Add default
  style, // Add style prop
  ...props
}) {
  const combinedStyle = { ...getAlertStyles({ variant }), ...style };
  return (
    <div
      data-slot="alert"
      role="alert"
      style={combinedStyle}
      className={className}
      {...props}
    />
  );
}

function AlertTitle({ className, style, ...props }) {
  // NOTE: col-start-2 and line-clamp-1 are lost.
  const titleStyle = {
    // minHeight: '1rem', // min-h-4
    fontWeight: "500", // font-medium
    letterSpacing: "-0.01em", // Approximated from tracking-tight
    overflow: "hidden", // Added for potential line clamp behavior
    whiteSpace: "nowrap", // Added for potential line clamp behavior
    textOverflow: "ellipsis", // Added for potential line clamp behavior
    ...style,
  };
  return (
    <div
      data-slot="alert-title"
      style={titleStyle}
      className={className}
      {...props}
    />
  );
}

function AlertDescription({ className, style, ...props }) {
  // NOTE: col-start-2, grid, justify-items, gap, [&_p] styling are lost.
  const descriptionStyle = {
    color: "var(--muted-foreground)",
    fontSize: "0.875rem", // text-sm
    ...style,
  };
  return (
    <div
      data-slot="alert-description"
      style={descriptionStyle}
      className={className}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription }

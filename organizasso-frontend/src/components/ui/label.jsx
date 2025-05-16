import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

function Label({ className, style, ...props }) {
  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1",
    fontWeight: "500",
    userSelect: "none",
    marginBottom: '0.75rem',
    ...style,
  };
  return (
    <LabelPrimitive.Root
      data-slot="label"
      style={labelStyle}
      className={className}
      {...props} />
  );
}

export { Label }

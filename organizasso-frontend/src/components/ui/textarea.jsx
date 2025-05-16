import * as React from "react"

function Textarea({ className, style, ...props }) {
  const textareaStyle = {
    display: "flex",
    minHeight: "4rem",
    width: "100%",
    borderRadius: "0.5rem",
    border: "1px solid var(--input)",
    backgroundColor: "transparent",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    transition: "color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    outline: "none",
    fieldSizing: "content",
    ...style,
  };
  return (
    <textarea
      data-slot="textarea"
      style={textareaStyle}
      className={className}
      {...props} />
  );
}

export { Textarea }

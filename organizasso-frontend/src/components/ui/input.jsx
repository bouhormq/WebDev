import * as React from "react"

function Input({
  className,
  type,
  style,
  ...props
}) {
  const inputStyle = {
    display: "flex",
    height: "2.5rem",
    width: "100%",
    minWidth: "0",
    borderRadius: "0.5rem",
    border: "1px solid var(--input)",
    backgroundColor: "transparent",
    padding: "0.25rem 0.75rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    transition: "color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    outline: "none",
    ...style,
  };

  return (
    <input
      type={type}
      data-slot="input"
      style={inputStyle}
      className={className}
      {...props} />
  );
}

export { Input }

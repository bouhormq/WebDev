import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  style,
  ...props
}) {
  const contentStyle = {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    zIndex: 50,
    width: "18rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    padding: "1rem",
    outline: "none",
    ...style,
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        style={contentStyle}
        className={className}
        {...props} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

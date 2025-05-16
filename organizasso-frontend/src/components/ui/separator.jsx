"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  style,
  ...props
}) {
  const separatorStyle = {
    flexShrink: 0,
    backgroundColor: "var(--border)",
    height: orientation === "horizontal" ? "1px" : "100%",
    width: orientation === "horizontal" ? "100%" : "1px",
    ...style,
  };

  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      style={separatorStyle}
      className={className}
      {...props} />
  );
}

export { Separator }

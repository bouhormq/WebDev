"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import styles from './styles/separator.module.css'; // Import CSS module

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  // Determine orientation class
  const orientationClass = orientation === "horizontal" ? styles.horizontal : styles.vertical;

  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={`${styles.separator} ${orientationClass} ${className || ''}`.trim()}
      {...props} />
  );
}

export { Separator }

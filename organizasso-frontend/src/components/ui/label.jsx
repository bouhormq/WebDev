import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import styles from './styles/label.module.css'; // Import CSS module

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={`${styles.label} ${className || ''}`.trim()}
      {...props} />
  );
}

export { Label }

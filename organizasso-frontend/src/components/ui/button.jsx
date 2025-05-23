import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import styles from './styles/button.module.css'; // Import CSS module

// Helper function to map props to CSS module classes
const getButtonClasses = ({ variant, size }) => {
  const variantClass = styles[variant] || styles.defaultVariant;
  const sizeClass = styles[size] || styles.defaultSize;
  // For 'icon' size, use styles.iconSize specifically if defined, otherwise defaultSize
  const specificSizeClass = size === 'icon' ? (styles.iconSize || sizeClass) : sizeClass;

  return `${styles.button} ${variantClass} ${specificSizeClass}`.trim();
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const buttonClasses = getButtonClasses({ variant, size });

  return (
    <Comp
      data-slot="button"
      className={`${buttonClasses} ${className || ''}`.trim()} // Combine module classes with external className
      {...props} />
  );
}

export { Button }

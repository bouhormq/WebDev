import * as React from "react"
import styles from './styles/alert.module.css';

// Remove getAlertStyles entirely or leave above unused and focus on below

function Alert({
  className,
  variant = "default", // Add default
  ...props
}) {
  // Use CSS module classes instead of inline styles
  const variantClass = variant === 'destructive' ? styles.destructive : '';
  return (
    <div
      data-slot="alert"
      role="alert"
      className={`${styles.alert} ${variantClass} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={`${styles.title} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={`${styles.description} ${className || ''}`.trim()}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription }

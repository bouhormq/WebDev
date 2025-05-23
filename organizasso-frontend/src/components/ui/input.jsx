import * as React from "react"
import styles from './styles/input.module.css'; // Import CSS module

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`${styles.input} ${className || ''}`.trim()}
      {...props} 
    />
  );
}

export { Input }

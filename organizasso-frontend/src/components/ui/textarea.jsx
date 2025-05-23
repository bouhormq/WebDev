import * as React from "react"
import styles from './styles/textarea.module.css'

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={`${styles.textarea} ${className || ''}`.trim()}
      {...props} />
  );
}

export { Textarea }


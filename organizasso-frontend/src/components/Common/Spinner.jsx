import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './styles/Spinner.module.css';

const getSpinnerClassName = (size) => {
  switch (size) {
    case "sm":
      return styles.spinnerSm;
    case "lg":
      return styles.spinnerLg;
    case "xl":
      return styles.spinnerXl;
    case "default":
    default:
      return styles.spinnerDefault;
  }
};

const Spinner = ({ size = "default", className, style }) => {
  const spinnerSizeClass = getSpinnerClassName(size);
  return (
    <Loader2 style={style} className={`${styles.spinnerBase} ${spinnerSizeClass} ${className || ''}`} />
  );
};

export default Spinner;

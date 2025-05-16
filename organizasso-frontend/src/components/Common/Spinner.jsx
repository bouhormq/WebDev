import React from 'react';
import { Loader2 } from 'lucide-react';

// Helper function for spinner sizes
// NOTE: animate-spin is LOST.
const getSpinnerStyles = ({ size }) => {
  let styles = {
    color: "var(--primary)",
    // animation: 'spin 1s linear infinite', // animate-spin lost
  };

  switch (size) {
    case "sm":
      styles = { ...styles, height: '1rem', width: '1rem' }; // h-4 w-4
      break;
    case "lg":
      styles = { ...styles, height: '2.5rem', width: '2.5rem' }; // h-10 w-10
      break;
    case "xl":
      styles = { ...styles, height: '4rem', width: '4rem' }; // h-16 w-16
      break;
    case "default":
    default:
      styles = { ...styles, height: '1.5rem', width: '1.5rem' }; // h-6 w-6
      break;
  }
  return styles;
};

const Spinner = ({ size = "default", className, style }) => {
  const combinedStyle = { ...getSpinnerStyles({ size }), ...style };
  return (
    <Loader2 style={combinedStyle} className={className} />
  );
};

export default Spinner;

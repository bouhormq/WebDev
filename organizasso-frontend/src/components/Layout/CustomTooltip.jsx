import React, { useState } from 'react';
import styles from './styles/CustomTooltip.module.css';

const CustomTooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)} // For accessibility with keyboard navigation
      onBlur={() => setIsVisible(false)}  // For accessibility with keyboard navigation
      tabIndex={0} // Make the wrapper focusable if children aren't inherently
    >
      {children}
      <div className={`${styles.tooltipText} ${isVisible ? styles.tooltipTextVisible : ''}`}>
        {text}
      </div>
    </div>
  );
};

export default CustomTooltip;
import React, { useState } from 'react';

const CustomTooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipStyle = {
    position: 'absolute',
    top: '100%', // Changed from bottom: '100%'
    left: '50%',
    transform: 'translateX(-50%) translateY(8px)', // Changed from translateY(-8px)
    backgroundColor: 'black',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25', // Ensure text fits well
    whiteSpace: 'nowrap',
    zIndex: 100, // Ensure it's above other elements
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.15s ease-in-out, visibility 0.15s ease-in-out',
    pointerEvents: 'none', // So it doesn't interfere with mouse events on the icon itself
  };

  const wrapperStyle = {
    position: 'relative', // Needed for absolute positioning of the tooltip
    display: 'inline-flex', // To wrap children appropriately
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)} // For accessibility with keyboard navigation
      onBlur={() => setIsVisible(false)}  // For accessibility with keyboard navigation
      tabIndex={0} // Make the wrapper focusable if children aren't inherently
    >
      {children}
      <div style={tooltipStyle}>
        {text}
      </div>
    </div>
  );
};

export default CustomTooltip; 
import React from 'react';

const Footer = () => {

  // --- Inline Styles ---
  const footerStyle = {
    paddingTop: '1.5rem', // py-6
    paddingBottom: '1.5rem', // py-6
    borderTop: '1px solid var(--border-alpha)', // border-t border-border/40
    // md:px-8 md:py-0 lost
  };
  const containerStyle = {
    // container class usually sets max-width and mx-auto, maybe inherit from PageWrapper?
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem', // gap-4
    // md:h-24 md:flex-row lost
  };
  const pStyle = {
    textAlign: 'center', // text-center (md:text-left lost)
    fontSize: '0.875rem', // text-sm
    lineHeight: 1.8, // leading-loose (approx)
    color: 'var(--muted-foreground)',
    // textBalance: 'balance', // text-balance (needs CSS support)
  };
  // --- End Inline Styles ---

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <p style={pStyle}>
          &copy; {new Date().getFullYear()} Organizasso. All rights reserved.
        </p>
        {/* Add social links or other footer items here if needed */}
      </div>
    </footer>
  );
};

export default Footer;

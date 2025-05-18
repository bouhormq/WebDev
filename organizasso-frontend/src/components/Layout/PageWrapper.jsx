import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HorizontalNavBar from './HorizontalNavBar';
import { Toaster } from "@/components/ui/sonner";

const PageWrapper = ({ children }) => {

  // --- Inline Styles ---
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
  };
  const mainStyle = {
    flexGrow: 1,
    minWidth: '60%', 
    margin: '0 auto',
    padding: '2rem 1rem', // py-8 px-4 (sm/lg padding lost)
    position: 'relative',
    zIndex: 1,
  };
  // --- End Inline Styles ---

  return (
    <div style={wrapperStyle}>
      <Header />
      <HorizontalNavBar />
      <main style={mainStyle}>
        {children}
      </main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default PageWrapper;

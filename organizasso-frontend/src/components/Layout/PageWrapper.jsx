import React from 'react';
import Header from './Header';
import Footer from './Footer';
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
    maxWidth: '64rem', // max-w-5xl
    margin: '0 auto',
    padding: '2rem 1rem', // py-8 px-4 (sm/lg padding lost)
  };
  // --- End Inline Styles ---

  return (
    <div style={wrapperStyle}>
      <Header />
      <main style={mainStyle}>
        {children}
      </main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default PageWrapper;

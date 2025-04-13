import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from "@/components/ui/sonner";

const PageWrapper = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <Toaster richColors />
    </div>
  );
};

export default PageWrapper;

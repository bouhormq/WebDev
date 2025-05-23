import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HorizontalNavBar from './HorizontalNavBar';
import { Toaster } from "@/components/ui/sonner";
import styles from './styles/PageWrapper.module.css'; // Import CSS module

const PageWrapper = ({ children }) => {

  return (
    <div className={styles.wrapper}>
      <Header />
      <HorizontalNavBar />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default PageWrapper;

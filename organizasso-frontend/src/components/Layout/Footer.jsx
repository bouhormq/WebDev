import React from 'react';
import styles from './styles/Footer.module.css'; // Import the CSS module

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.pStyle}>
          &copy; {new Date().getFullYear()} Organizasso. All rights reserved.
        </p>
        {/* Add social links or other footer items here if needed */}
      </div>
    </footer>
  );
};

export default Footer;

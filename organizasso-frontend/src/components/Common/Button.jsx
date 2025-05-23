import React from 'react';
import styles from './styles/Button.module.css'; // Import the CSS module

const Button = ({ children, onClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

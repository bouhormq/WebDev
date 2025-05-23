import React from 'react';
import styles from './styles/Modal.module.css'; // Import the CSS module

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modal}>
      Modal Component: {children}
      <button onClick={onClose} className={styles.closeButton}>
        Close
      </button>
    </div>
  );
};

export default Modal;

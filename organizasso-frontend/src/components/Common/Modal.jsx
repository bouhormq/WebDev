import React from 'react';

const Modal = ({ children, isOpen, onClose }) => { // eslint-disable-line no-unused-vars
  if (!isOpen) return null;
  return <div>Modal Component: {children}</div>;
};

export default Modal;

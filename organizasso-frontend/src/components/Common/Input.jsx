import React from 'react';
import styles from './styles/Input.module.css'; // Import the CSS module

const Input = ({ type, value, onChange }) => {
  return <input type={type} value={value} onChange={onChange} className={styles.input} />;
};

export default Input;

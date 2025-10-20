import React from 'react';
import styles from './styles.module.css';

export function Button(props) {
  const { className, ...rest } = props;
  return <button className={`${styles.button} ${className}`} {...rest} />;
}
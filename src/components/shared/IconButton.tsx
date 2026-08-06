import { type ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`${styles.button} ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}

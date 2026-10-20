import { motion } from 'framer-motion';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { type: 'spring', stiffness: 300 } } : undefined}
      className={`surface rounded-xl2 shadow-soft overflow-hidden ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

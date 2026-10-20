import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-accent to-accent-secondary text-white shadow-glow hover:brightness-110',
  secondary: 'surface text-text-primary hover:border-white/20 hover:bg-white/10',
  ghost: 'bg-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary',
  danger: 'bg-error/10 text-error hover:bg-error hover:text-white border border-error/30',
  outline: 'bg-transparent border border-accent/40 text-accent hover:bg-accent/10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', icon, children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ring-0 ${variantStyles[variant]} ${className}`}
        {...(props as any)}
      >
        {icon}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

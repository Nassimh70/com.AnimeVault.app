import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color = '#6366F1', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border border-white/10 backdrop-blur-sm ${className}`}
      style={{ backgroundColor: `${color}18`, color, boxShadow: `inset 0 1px 0 ${color}30` }}
    >
      {children}
    </span>
  );
}

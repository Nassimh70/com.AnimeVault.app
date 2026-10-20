import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      <div className="w-16 h-16 rounded-[1.4rem] bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-white/10 flex items-center justify-center text-accent shadow-glow mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-text-secondary max-w-md mb-5">{subtitle}</p>}
      {action}
    </motion.div>
  );
}

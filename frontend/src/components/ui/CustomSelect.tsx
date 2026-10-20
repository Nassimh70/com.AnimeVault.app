import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Sélectionner', className = '' }: CustomSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, width: 0 });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        setCoords({
          left: rect.left,
          top: rect.bottom + 8, // 0.5rem space
          width: rect.width,
        });
      }
    }

    updatePosition();

    let rafId: number;
    function onScroll() {
      rafId = requestAnimationFrame(updatePosition);
    }

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePosition);
      cancelAnimationFrame(rafId);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative isolate z-[9999] min-w-0 overflow-visible ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="anime-select-trigger flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-accent/40 hover:bg-white/12 focus:outline-none focus:ring-4 focus:ring-accent/15"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${selectedOption ? 'text-text-primary' : 'text-text-secondary'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed z-[99999] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/98 shadow-[0_24px_70px_rgba(1,6,17,0.65)] backdrop-blur-xl"
              style={{ left: coords.left, top: coords.top, width: coords.width }}
              role="listbox"
            >
              <div className="border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Choisir une option
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <button
                      key={option.value || option.label}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 border border-transparent ${
                        active
                          ? 'bg-gradient-to-r from-accent/25 to-accent-secondary/18 text-white border-white/10'
                          : 'text-text-secondary hover:bg-white/10 hover:text-white'
                      }`}
                      role="option"
                      aria-selected={active}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{option.label}</span>
                        {option.description && <span className="block truncate text-[11px] text-[#b7c2d6]">{option.description}</span>}
                      </span>
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent to-accent-secondary shadow-glow" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
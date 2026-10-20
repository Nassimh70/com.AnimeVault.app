/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-bg) / <alpha-value>)',
        canvasSoft: 'rgb(var(--color-bg-soft) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surfaceRaised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
        surfaceMuted: 'rgb(var(--color-surface-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-text) / <alpha-value>)',
        inkSoft: 'rgb(var(--color-text-soft) / <alpha-value>)',
        inkFaint: 'rgb(var(--color-text-faint) / <alpha-value>)',
        brass: 'rgb(var(--color-brass) / <alpha-value>)',
        brassStrong: 'rgb(var(--color-brass-strong) / <alpha-value>)',
        moon: 'rgb(var(--color-moon) / <alpha-value>)',
        jade: 'rgb(var(--color-jade) / <alpha-value>)',
        rose: 'rgb(var(--color-rose) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Outfit Variable', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 24px 70px -28px rgba(2, 6, 16, 0.65)',
        lift: '0 30px 80px -32px rgba(2, 6, 16, 0.8)',
        glow: '0 0 0 1px rgba(var(--color-brass), 0.18), 0 18px 50px -24px rgba(var(--color-brass), 0.45)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      letterSpacing: {
        editorial: '0.18em',
      },
      opacity: {
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        22: '0.22',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      transitionTimingFunction: {
        vault: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        rise: 'rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        fade: 'fade 0.4s ease-out both',
        shimmer: 'shimmer 1.7s linear infinite',
        drift: 'drift 9s ease-in-out infinite',
        pop: 'pop 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        safe: {
          DEFAULT: '#34d399',
          muted: 'rgba(52, 211, 153, 0.12)',
        },
        caution: {
          DEFAULT: '#fbbf24',
          muted: 'rgba(251, 191, 36, 0.12)',
        },
        danger: {
          DEFAULT: '#f43f5e',
          muted: 'rgba(244, 63, 94, 0.12)',
        },
        prohibited: '#f43f5e',
        accent: {
          DEFAULT: '#3b82f6',
          muted: 'rgba(59, 130, 246, 0.12)',
          strong: '#60a5fa',
        },
        live: {
          DEFAULT: '#22d3ee',
          muted: 'rgba(34, 211, 238, 0.12)',
        },
        surface: {
          base: '#0a0e17',
          DEFAULT: '#0f1420',
          card: '#131a2b',
          elevated: '#1a2236',
          hover: '#1e2840',
        },
        border: {
          DEFAULT: '#1e293b',
          subtle: '#162032',
          strong: '#334155',
        },
        text: {
          primary: '#e8ecf4',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      boxShadow: {
        'glow-danger': '0 0 20px rgba(244, 63, 94, 0.3)',
        'glow-safe': '0 0 20px rgba(52, 211, 153, 0.3)',
        'glow-accent': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-caution': '0 0 20px rgba(251, 191, 36, 0.3)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
        'slide-in-left': 'slideInLeft 0.3s ease-out both',
        'scale-in': 'scaleIn 0.25s ease-out both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'progress-fill': 'progressFill 1s ease-out both',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
        'count-up': 'countUp 0.5s ease-out both',
        'spin-slow': 'spin 2s linear infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
};

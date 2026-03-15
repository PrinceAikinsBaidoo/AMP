/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#020817',
        surface: '#0f172a',
        'surface-2': '#131f35',
        border: '#1e293b',
        'border-bright': '#2d3f5c',
        cyan: {
          DEFAULT: '#22d3ee',
          dim: '#22d3ee44',
          glow: '#22d3ee88',
        },
        amber: {
          DEFAULT: '#fbbf24',
          dim: '#fbbf2444',
          glow: '#fbbf2488',
        },
        red: {
          DEFAULT: '#f87171',
          dim: '#f8717144',
          glow: '#f8717188',
        },
        green: {
          DEFAULT: '#34d399',
          dim: '#34d39944',
          glow: '#34d39988',
        },
        purple: {
          DEFAULT: '#a78bfa',
          dim: '#a78bfa44',
          glow: '#a78bfa88',
        },
        'text-dim': '#64748b',
        'text-body': '#94a3b8',
        'text-bright': '#e2e8f0',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'glow-cyan': 'glow-cyan 2s ease-in-out infinite',
        'glow-amber': 'glow-amber 2s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'glow-red': 'glow-red 2s ease-in-out infinite',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'glow-cyan': {
          '0%, 100%': { boxShadow: '0 0 8px #22d3ee44' },
          '50%': { boxShadow: '0 0 20px #22d3ee88, 0 0 40px #22d3ee44' },
        },
        'glow-amber': {
          '0%, 100%': { boxShadow: '0 0 8px #fbbf2444' },
          '50%': { boxShadow: '0 0 20px #fbbf2488, 0 0 40px #fbbf2444' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 8px #34d39944' },
          '50%': { boxShadow: '0 0 20px #34d39988, 0 0 40px #34d39944' },
        },
        'glow-red': {
          '0%, 100%': { boxShadow: '0 0 8px #f8717144' },
          '50%': { boxShadow: '0 0 20px #f8717188, 0 0 40px #f8717144' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

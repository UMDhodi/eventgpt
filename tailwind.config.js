/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Base tokens
        ink: {
          950: '#0B0A10',
          900: '#14121C',
          700: '#2A2636',
          DEFAULT: '#0B0A10',
        },
        ivory: {
          50: '#F6F0E6',
          DEFAULT: '#F6F0E6',
        },
        muted: '#A9A3B8',
        white: '#FFFFFF',

        // Dynamic theme variables
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',

        // Named event accents for direct reference
        gold: '#E8B84A',
        violet: '#7B4DFF',
        blue: '#2FA8FF',
        sage: '#8FA98A',
        champagne: '#E9D8C4',
        'confetti-gold': '#FFC83D',
        coral: '#FF6B6B',
        mint: '#6EE7C8',

        // Footer tokens
        terracotta: {
          DEFAULT: '#C4623A',
          dark: '#9E4A2A',
        },
        cream: {
          DEFAULT: '#F5EBDD',
          card: '#F5EBDD',
        },
      },
      borderRadius: {
        'input': '12px',
        'card': '20px',
        'hero': '32px',
        'pill': '9999px',
      },
      spacing: {
        'section-desk': '160px',
        'section-tab': '96px',
        'section-mob': '64px',
      },
      boxShadow: {
        'accent-glow': '0 0 80px rgba(var(--accent-rgb), 0.25)',
      },
      keyframes: {
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
      },
      animation: {
        'marquee': 'marquee 28s linear infinite',
        'fade-rise': 'fade-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

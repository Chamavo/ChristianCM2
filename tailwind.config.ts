import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gryffondor: { DEFAULT: '#740001', secondary: '#D3A625' },
        serdaigle:  { DEFAULT: '#0E1A40', secondary: '#946B2D' },
        poufsouffle:{ DEFAULT: '#FFDB00', secondary: '#000000' },
        serpentard: { DEFAULT: '#1A472A', secondary: '#AAAAAA' },
        parchemin: '#f4e4bc',
        encre: '#3a2a1a'
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sorcier: ['"Cinzel"', 'Georgia', 'serif']
      },
      animation: {
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'badge-pop': 'badgePop 0.5s ease-out'
      },
      keyframes: {
        sparkle: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        badgePop: { '0%': { transform: 'scale(0) rotate(-180deg)' }, '100%': { transform: 'scale(1) rotate(0)' } }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;

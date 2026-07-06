// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pool: {
          deep: '#1a0a2e',
          mid: '#2d1b69',
          surface: '#4c2a8a',
          shimmer: '#7c3aed',
          glow: '#a78bfa',
          pearl: '#f5f0ff',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config

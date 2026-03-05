import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'night-indigo': '#2B2F5A',
        'deep-periwinkle': '#3A4A86',
        'soft-navy': '#2A3A68',
        'fairy-gold': '#F4D27A',
        'mist-blue': '#AFC6FF',
        'cloud-white': '#EAF0FF',
        'text-secondary': '#B8C2E6',
        'text-muted': '#8E98C7',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

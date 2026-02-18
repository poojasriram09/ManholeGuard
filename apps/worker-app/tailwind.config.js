/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        safe: '#22c55e',
        caution: '#f59e0b',
        prohibited: '#ef4444',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#efe6d4',
        ink: '#1c2416',
        marsh: '#17352c',
        moss: '#21573a',
        brass: '#8a5a2b',
        clay: '#8d3b32',
        card: '#f7f1e4',
        line: '#d5cbb8',
        mist: '#e6dccb',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(28, 36, 22, 0.04)',
      },
    },
  },
  plugins: [],
};

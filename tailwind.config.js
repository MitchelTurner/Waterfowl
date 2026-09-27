/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4efe3',
        ink: '#1a140f',
        marsh: '#14110e',
        moss: '#1e4632',
        brass: '#6d4a28',
        clay: '#9d1c1c',
        card: '#fbf7ee',
        line: '#c9bea6',
        mist: '#ebe3d2',
      },
      fontFamily: {
        sans: ['"Libre Baskerville"', 'Georgia', 'ui-serif', 'serif'],
        display: ['"Libre Baskerville"', 'Georgia', 'ui-serif', 'serif'],
        kicker: ['Oswald', '"Arial Narrow"', 'sans-serif'],
      },
      borderRadius: {
        sm: '0px',
        md: '0px',
      },
      boxShadow: {
        card: 'none',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          saffron: '#F4A261',
          deepBlue: '#264653',
          warmGold: '#E76F51',
        },
        secondary: {
          ivory: '#FFFBF0',
          earthBrown: '#8B7355',
          lightGray: '#F5F5F5',
        },
        accent: {
          coral: '#E76F51',
          sage: '#2A9D8F',
        },
      },
      fontFamily: {
        headings: ['Suranna', 'Playfair Display', 'serif'],
        body: ['Noto Sans Telugu', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        hover: '0 12px 24px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    },
  },
  plugins: [],
}

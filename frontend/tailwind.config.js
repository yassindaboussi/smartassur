/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6c63ff',
        secondary: '#a78bfa',
        accent: '#f0b429',
        bg: '#07080f',
        'bg-2': '#0e1120',
        'bg-3': '#141728',
        surface: '#1a1f35',
        'surface-2': '#212640',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        lg: '20px',
      },
    },
  },
  plugins: [],
}

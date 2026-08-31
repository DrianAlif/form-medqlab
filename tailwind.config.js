/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sheet: {
          green: '#c6e0b4',
          'green-light': '#e2efda',
          gray: '#d9d9d9',
          'gray-light': '#f2f2f2',
          red: '#c00000',
          redLight: '#ff4d4d'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        signature: ['"Brush Script MT"', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}

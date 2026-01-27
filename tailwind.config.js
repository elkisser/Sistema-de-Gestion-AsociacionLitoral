/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F14',
          secondary: '#11161D',
          tertiary: '#151B23',
        },
        border: '#1F2937',
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
        },
        brand: {
          DEFAULT: '#22FF88', // Green neon
          hover: '#1CE678',
        },
        status: {
          success: '#22FF88',
          warning: '#FFC857',
          danger: '#FF5D5D',
          info: '#3ABEFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
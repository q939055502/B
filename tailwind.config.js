/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        green: {
          500: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
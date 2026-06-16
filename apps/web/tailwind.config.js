/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: '#3b82f6',
        love: '#eb6f92',
        gold: '#f6c177',
        foam: '#9ccfd8',
        surface: '#1f1d2e',
        base: '#191724',
        overlay: '#26233a',
        primary: '#e0def4',
        subtle: '#908caa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

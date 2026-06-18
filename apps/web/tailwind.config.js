/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: '#3b82f6', // blue-500
        love: '#f43f5e', // rose-500
        gold: '#f59e0b', // amber-500
        foam: '#38bdf8', // sky-400
        surface: '#1e293b', // slate-800
        base: '#0f172a', // slate-900
        overlay: '#334155', // slate-700
        primary: '#f8fafc', // slate-50
        subtle: '#94a3b8', // slate-400
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

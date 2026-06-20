/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: 'rgb(var(--color-pine) / <alpha-value>)',
        love: 'rgb(var(--color-love) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        foam: 'rgb(var(--color-foam) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        base: 'rgb(var(--color-base) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

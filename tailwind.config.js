/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35', // Sunset Orange
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F7931E', // Honey Gold
          foreground: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#C44536', // Deep Coral
          foreground: '#FFFFFF',
        },
        background: '#FFFBF5', // Warm white
        surface: '#FFFFFF', // Pure white
        text: {
          primary: '#2C2C2C', // Almost black
          secondary: '#6B6B6B', // Medium gray
        },
        border: '#E5E5E5', // Light gray
        success: '#00B894', // Mint green
        warning: '#FDCB6E', // Soft yellow
        error: '#D63031', // Red
        info: '#0984E3', // Blue
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

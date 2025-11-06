/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Poppins']
      },
      textColor: {
        black: '#373737',
      },
      colors: {
        background: {
          light: '#ffffff',
          dark: '#111827',
        },
        text: {
          light: '#111827',
          dark: '#f9fafb',
        },
        primary: '#3b82f6',
      },
      "fonts": [
        {
          "asset": "./src/assets/fonts/Poppins-Regular.ttf",
          "family": "Poppins-Regular"
        },
        {
          "asset": "./src/assets/fonts/Poppins-Medium.ttf",
          "family": "Poppins-Medium"
        },
        {
          "asset": "./src/assets/fonts/Poppins-SemiBold.ttf",
          "family": "Poppins-SemiBold"
        },
        {
          "asset": "./src/assets/fonts/Poppins-Bold.ttf",
          "family": "Poppins-Bold"
        }
      ]
    },
  },
  plugins: [],
  darkMode: 'class',
}
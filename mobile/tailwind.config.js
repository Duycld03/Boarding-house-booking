/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6',
          dark: '#60a5fa',
        },
        background: {
          light: '#ffffff',
          dark: '#111827',
        },
        text: {
          light: '#111827',
          dark: '#f9fafb',
        },
        secondary: {
          light: '#6b7280',
          dark: '#9ca3af',
        },
        card: {
          light: '#f3f4f6',
          dark: '#1f2937',
        }
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
  darkMode: "class",
  plugins: [],
};
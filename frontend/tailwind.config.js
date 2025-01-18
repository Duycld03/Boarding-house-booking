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
        primary: '#40BFFF'
      }

    },
  },
  plugins: [],
}
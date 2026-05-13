/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        butterpop: ['Butterpop', 'cursive'],
        stretchpro: ['StretchPro', 'sans-serif'],
        cocogoose: ['Cocogoose', 'sans-serif'],
      },

      colors: {
        primary: "#335eea",
        primary1: "#5ffd00",
        primary2: "#0b2c5f",
        primary3: "#f8f7f3",
        primary4: "#fafafa",
        primary5: "#f2f1ed",
        primary6: "#0511a8",
      },

      screens: {
        '2xl': '1600px',
      },
    },
  },
  plugins: [],
}
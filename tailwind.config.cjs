/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter','ui-sans-serif','system-ui','sans-serif'],
      },
    },
  },
  plugins: [],
}

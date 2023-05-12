/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0E78EF",
        white: "#FFFFFF",
        lightgray: "#eeeeee",
        darkgray: "#999999",
        darkergray: "#666666",
        dark: "#333333",
        darkblue: "#092e6b",
      },
    },
  },
  plugins: [],
};

module.exports = config;

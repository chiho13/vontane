/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
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
      animation: {
        rotate: "rotate 2s linear infinite",
        dash: "dash 1.5s ease-in-out infinite",
      },
      keyframes: {
        rotate: {
          "100%": { transform: "rotate(360deg)" },
        },
        dash: {
          "0%": { "stroke-dasharray": "1, 150", "stroke-dashoffset": "0" },
          "50%": { "stroke-dasharray": "90, 150", "stroke-dashoffset": "-35" },
          "100%": {
            "stroke-dasharray": "90, 150",
            "stroke-dashoffset": "-124",
          },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;

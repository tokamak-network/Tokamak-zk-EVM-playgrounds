/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./index.html"],
  theme: {
    extend: {
      animation: {
        rain: "rain 1.5s linear infinite",
      },
      keyframes: {
        rain: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(20px)" },
        },
      },
    },
  },
  plugins: [],
};

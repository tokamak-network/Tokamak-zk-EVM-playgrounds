/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./index.html"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        jersey: ["Jersey 10", "cursive"],
        "ibm-mono": ["IBM Plex Mono", "monospace"],
      },
      dropShadow: {
        title: "0 1px 0 #a17510, 0 2px 0 #a17510",
      },
      keyframes: {
        focusEffect: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "0" },
        },
        rain: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(20px)" },
        },
      },
      animation: {
        focusEffect: "focusEffect 1s ease-in-out",
        rain: "rain 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};

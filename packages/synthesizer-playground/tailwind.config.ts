import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        jersey: ["Jersey 10", "cursive"],
        'ibm-mono': ["IBM Plex Mono", "monospace"],
      },
      dropShadow: {
        'title': '0 1px 0 #a17510, 0 2px 0 #a17510',
      },
    },
  },
  plugins: [],
} satisfies Config;

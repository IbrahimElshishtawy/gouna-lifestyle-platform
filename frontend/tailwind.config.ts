import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          terracotta: "#B85D3B",
          "terracotta-dark": "#9A4A2B",
          "terracotta-light": "#D48162",
          sand: "#E5DCD3",
          "sand-light": "#F6F3EE",
          "sand-card": "#FAF8F5",
          brown: "#3D2E26",
          "brown-dark": "#291F1A",
          "brown-muted": "#786B63",
          border: "#E8E2D9",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", '"Plus Jakarta Sans"', "sans-serif"],
        serif: ["var(--font-playfair)", '"Playfair Display"', "serif"],
        arabic: ["var(--font-tajawal)", '"Tajawal"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

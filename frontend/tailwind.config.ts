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
          terracotta: "#A55332",
          "terracotta-dark": "#883E22",
          "terracotta-light": "#C46B48",
          sand: "#DBC0A0",
          "sand-light": "#F7F2EC",
          "sand-card": "#FAF6F0",
          cream: "#E9D9C4",
          taupe: "#8C6F56",
          brown: "#5B4635",
          "brown-dark": "#3D2E24",
          "brown-muted": "#8C6F56",
          border: "#E9D9C4",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", '"Plus Jakarta Sans"', "sans-serif"],
        serif: ['"Recoleta"', '"Recoleta Demo"', '"Fraunces"', '"Playfair Display"', "serif"],
        recoleta: ['"Recoleta"', '"Recoleta Demo"', '"Fraunces"', '"Playfair Display"', "serif"],
        arabic: ["var(--font-tajawal)", '"Tajawal"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

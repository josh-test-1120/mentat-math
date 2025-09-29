import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "mentat-black": "#171717",
        "mentat-gold": {
            DEFAULT: "#dab05a",
            700: "#987b3e"
        },
        crimson: {
          DEFAULT: "#A30F32",
          700: "#8e0d2b",
        },
      },
    },
  },
  plugins: [
      require("flowbite/plugin"),
      require('tailwind-scrollbar')
  ],
};
export default config;

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
      animation: {
        'typewriter': 'typewriter 0.5s ease-in-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        typewriter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
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

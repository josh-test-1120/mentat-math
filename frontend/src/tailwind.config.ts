import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";

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
          900: "rgb(142, 13, 50 / 0.05)"
        },
        "card-color": "rgb(255 255 255 / 0.05)",
        "button-hover": "#d1d5db"
      },
      animation: {
        'typewriter': 'typewriter 0.5s ease-in-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'artistic-reveal': 'artisticReveal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
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
        artisticReveal: {
          '0%': {
              opacity: '0',
              transform: 'translateY(30px) rotate(10deg) scale(0.8)',
          },
          '50%': {
              opacity: '0.7',
              transform: 'translateY(-5px) rotate(-2deg) scale(1.1)',
          },
          '100%': {
              opacity: '1',
              transform: 'translateY(0) rotate(0deg) scale(1)',
          },
        },
      },
    },
  },
  plugins: [
      require("flowbite/plugin"),
      require('@tailwindcss/forms'),
      require('tailwind-scrollbar'),
      require('tailwind-scrollbar-hide'),
      function({ addComponents }: PluginAPI) {
          addComponents({
              '.focus-mentat': {
                  '@apply ring-2 outline-none ring-mentat-gold-700 ring-opacity-75': {},
              },
          })
      },
  ],
};
export default config;

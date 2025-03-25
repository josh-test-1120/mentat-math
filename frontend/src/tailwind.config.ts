import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pageClient.tsx/**/*.{js,ts,jsx,tsx,mdx}",
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
        "mentat-black": "#212121",
        "mentat-gold": "#dab05a",
      },
    },
  },
  plugins: [
      require("flowbite/plugin")
  ],
};
export default config;

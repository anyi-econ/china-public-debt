import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#122033",
        slateBlue: "#35577d",
        mist: "#f4f7fb",
        line: "#d6e0ea",
        accent: "#5a7aa1"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(18, 32, 51, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;

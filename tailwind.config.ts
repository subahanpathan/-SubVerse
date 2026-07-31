import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "#FF4500", // Reddit Orange/Red Accent
          hover: "#E03D00",
          light: "#FF5414",
          dark: "#D03800",
        },
        surface: {
          DEFAULT: "#1A1A1B", // Dark Mode Reddit Card Surface
          hover: "#272729",
          border: "#343536",
          darker: "#0D0D0E",
        },
      },
    },
  },
  plugins: [],
};

export default config;

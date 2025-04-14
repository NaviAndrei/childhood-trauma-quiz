import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8', // Tailwind blue-600 (darker for better contrast)
        secondary: '#e5e7eb', // Tailwind gray-200
        accent: '#14b8a6',    // Tailwind teal-500
      },
    },
  },
  plugins: [],
};
export default config; 
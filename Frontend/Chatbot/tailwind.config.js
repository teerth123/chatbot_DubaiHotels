/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // This ensures Tailwind processes all your JS/JSX files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

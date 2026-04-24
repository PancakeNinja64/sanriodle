/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#ffd7ea",
        cream: "#fff9f1",
        sky: "#dff3ff",
        lavender: "#eee5ff",
        mint: "#d8f7e9",
        peach: "#ffe7d1",
        rose: "#ffb7d5",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(255, 164, 202, 0.25)",
      },
      fontFamily: {
        cute: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

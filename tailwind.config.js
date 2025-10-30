/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6E69D1", // البنفسجي الأساسي
        dark: "#141A37", // للأزرار والنصوص
        border: "#DBDAEA", // للـ borders
        light: "#F0EFF6", // للخلفية الفاتحة
      },
      fontFamily: {
        sans: ["Tajawal", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

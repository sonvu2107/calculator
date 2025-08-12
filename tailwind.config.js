// tailwind.config.js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,.12)" }
    }
  },
  plugins: []
}

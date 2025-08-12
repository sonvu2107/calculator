import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Theme init: follow system, persist toggle
const LS_THEME = "calc-theme";
const saved = localStorage.getItem(LS_THEME);
const preferDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
if (saved === "dark" || (!saved && preferDark)) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(<App />);

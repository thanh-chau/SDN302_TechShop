import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./App.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: "#1f2937", color: "#fff" },
        success: { iconTheme: { primary: "#22c55e" } },
        error: { iconTheme: { primary: "#ef4444" } },
      }}
    />
  </StrictMode>,
);

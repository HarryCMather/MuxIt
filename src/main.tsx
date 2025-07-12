import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@muxit/css/index.css";
import App from "@muxit/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

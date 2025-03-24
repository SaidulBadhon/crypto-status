import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ProtectedApp from "./components/ProtectedApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProtectedApp />
  </StrictMode>
);

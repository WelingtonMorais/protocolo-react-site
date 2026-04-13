import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

const baseUrl = import.meta.env.BASE_URL;
const routerBasename = baseUrl.length > 1 ? baseUrl.replace(/\/$/, "") : undefined;

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

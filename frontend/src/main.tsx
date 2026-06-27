import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { AnalyticsProvider } from "./providers/AnalyticsProvider";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AnalyticsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnalyticsProvider>
  </StrictMode>,
);

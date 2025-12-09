import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/contexts/authContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initializeIntegrations } from "@/config/integrations";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "leaflet/dist/leaflet.css";

// Configure dayjs for Arabic locale
dayjs.locale("ar");

// Initialize third-party integrations
initializeIntegrations();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);

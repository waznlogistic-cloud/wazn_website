import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/contexts/authContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "leaflet/dist/leaflet.css";

// Configure dayjs for Arabic locale
dayjs.locale("ar");

// Initialize third-party integrations (non-blocking, won't crash app if fails)
// Defer initialization to avoid blocking app startup
setTimeout(() => {
  try {
    import("@/config/integrations").then((module) => {
      module.initializeIntegrations();
    }).catch((error) => {
      console.error("Failed to initialize integrations:", error);
    });
  } catch (error) {
    console.error("Failed to load integrations module:", error);
  }
}, 100);

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

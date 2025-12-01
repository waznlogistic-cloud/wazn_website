import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/contexts/authContext";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "leaflet/dist/leaflet.css";

// Configure dayjs for Arabic locale
dayjs.locale("ar");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

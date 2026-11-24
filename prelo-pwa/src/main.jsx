// main.jsx — entry point, pendaftaran Service Worker PWA & BrowserRouter
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";

// Mendaftarkan Service Worker PWA secara otomatis
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("Konten baru tersedia, memperbarui Service Worker...");
  },
  onOfflineReady() {
    console.log("Aplikasi Prelo siap dijalankan dalam mode Offline!");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

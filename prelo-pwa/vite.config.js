import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg", "logo.png"],
      manifest: {
        name: "Prelo - Marketplace Gadget Bekas Terpercaya",
        short_name: "Prelo",
        description: "Aplikasi PWA jual beli gadget second berkualitas dengan inspeksi teruji",
        theme_color: "#94483d",
        background_color: "#fcf9f6",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Precache semua file inti frontend + seluruh gambar lokal (logo, comp, hp, jam, dll)
        globPatterns: ["**/*.{js,css,html,ico,svg,png,webp,webmanifest}"],
        // Batas cache hingga 3 MiB agar semua asset lokal retina ter-precache sempurna
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Fallback navigasi SPA agar refresh halaman apa pun saat offline tetap membuka aplikasi
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],

        // ========================================================
        // STRATEGI RUNTIME CACHING LENGKAP (API, IMAGES, FONTS)
        // ========================================================
        runtimeCaching: [
          {
            // 1. QUERY CACHING: Endpoint API Backend (NetworkFirst -> Cache)
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/") ||
              url.href.includes("localhost:3000/api") ||
              url.href.includes("/api/products") ||
              url.href.includes("/api/categories"),
            handler: "NetworkFirst",
            options: {
              cacheName: "prelo-api-query-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 jam
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3, // Jika backend offline/lambat > 3s, langsung pakai cache
            },
          },
          {
            // 2. IMAGE CACHING: Gambar Produk Eksternal & Upload (CacheFirst)
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "prelo-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 3. FONT STYLESHEETS: Google Fonts CSS (StaleWhileRevalidate)
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 4. WEBFONT BINARIES: Google Fonts .woff2 & Material Symbols (CacheFirst)
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});

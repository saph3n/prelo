# Prelo — Marketplace Gadget Bekas Terpercaya

Prelo adalah aplikasi Progressive Web App (PWA) modern untuk jual beli gadget second berkualitas dengan sistem inspeksi teruji, garansi, estimasi harga transparan, dan kemampuan offline query caching.

---

## 📱 Fitur Utama

- **Progressive Web App (PWA)**:
  - Dukungan penuh mode **Offline** via Service Worker & Workbox runtime query caching.
  - Installable (Add to Home Screen / Desktop App).
  - Precache retina assets & font icons (Material Symbols & Plus Jakarta Sans).
- **Katalog & Detail Produk**:
  - Filter kategori dinamis (Smartphone, Laptop, Tablet, Audio, Gaming, Aksesoris).
  - Pencarian gadget dengan query instant.
  - Manajemen stok unit interaktif (stepper +/- & quick presets).
  - Status stok real-time (Tersedia, Menipis, Habis).
- **Jual Gadget**:
  - Form penjualan gadget lengkap dengan upload gambar, kondisi fisik, dan minus unit.
- **Review & Ulasan Pengguna**:
  - Rating bintang interaktif dan tab ulasan pembeli terverifikasi.
- **Sistem Profil & Favorit**:
  - Simpan gadget favorit secara lokal.
  - Halaman profil pengguna dengan lencana verifikasi.

---

## 🛠️ Tech Stack

### Frontend (`prelo-pwa`)
- **React 19** + **Vite 8**
- **React Router 7**
- **vite-plugin-pwa** (Workbox, Service Worker, Web App Manifest)
- **CSS Design System**: Responsive Mobile-First & Desktop Grid, Earth-Tone Warm Palette

### Backend (`prelo-api`)
- **Node.js** + **Express**
- **Supabase** (Database PostgreSQL & Storage)
- **CORS**, **Dotenv**, **Axios**

---

## 🚀 Panduan Menjalankan Proyek

### 1. Backend (`prelo-api`)
```bash
cd prelo-api
npm install
# Salin .env.example menjadi .env dan sesuaikan kredensial Supabase
cp .env.example .env
npm run dev
```
Backend akan berjalan di `http://localhost:3000`.

### 2. Frontend PWA (`prelo-pwa`)
```bash
cd prelo-pwa
npm install
npm run dev
```
Frontend development akan berjalan di `http://localhost:5173`.

#### Menguji Mode Offline PWA:
```bash
cd prelo-pwa
npm run build
npm run preview
```
Buka `http://localhost:4173`, tunggu Service Worker aktif, lalu centang **Offline** pada DevTools Network untuk menguji pengalaman offline tanpa koneksi.

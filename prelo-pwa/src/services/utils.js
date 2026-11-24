// utils.js — helper favorit (localStorage) & format rupiah

const FAV_KEY = "prelo_favorites";

/** Ambil array id favorit dari localStorage */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}

/** Cek apakah produk id ada di favorit */
export function isFavorite(id) {
  return getFavorites().includes(id);
}

/** Tambah id ke favorit */
export function addFavorite(id) {
  const favs = getFavorites();
  if (!favs.includes(id)) {
    favs.push(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }
}

/** Hapus id dari favorit */
export function removeFavorite(id) {
  const favs = getFavorites().filter((f) => f !== id);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

/** Toggle favorit, kembalikan status baru */
export function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return true;
}

/** Format angka ke Rupiah, misal 1500000 → "Rp1.500.000" */
export function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/** URL placeholder jika image_url kosong */
export const PLACEHOLDER_IMG = "https://placehold.co/600x400?text=Prelo";


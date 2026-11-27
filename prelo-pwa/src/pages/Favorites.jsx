// Favorites.jsx — Halaman Favorit: daftar gadget tersimpan di localStorage
import { useState, useEffect } from "react";
import api from "../services/api";
import { getFavorites } from "../services/utils";
import ProductCard from "../components/ProductCard";

function Favorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const favIds = getFavorites();

    // Kalau belum ada favorit, langsung selesai
    if (favIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Ambil semua produk lalu filter yang favorit
    api
      .get("/products")
      .then((res) => {
        const filtered = res.data.filter((p) => favIds.includes(p.id));
        setProducts(filtered);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat favorit"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Favorit Saya</h1>
          <p className="page-subheader">Gadget yang kamu simpan untuk dipantau</p>
        </div>
        <span className="material-symbols-outlined page-header-icon">favorite</span>
      </div>

      {/* State: loading */}
      {loading && (
        <p className="state-msg loading-pulse">
          <span className="material-symbols-outlined">hourglass_top</span>
          Memuat favorit...
        </p>
      )}

      {/* State: error */}
      {error && (
        <p className="state-msg error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </p>
      )}

      {/* State: kosong */}
      {!loading && !error && products.length === 0 && (
        <p className="state-msg">
          <span className="material-symbols-outlined">heart_broken</span>
          Belum ada gadget favorit.<br />
          Klik ikon hati di halaman detail produk untuk menyimpannya di sini!
        </p>
      )}

      {/* Grid produk favorit responsif */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="section-header">
            <h3>Daftar Tersimpan ({products.length})</h3>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={(id) => setProducts((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Favorites;

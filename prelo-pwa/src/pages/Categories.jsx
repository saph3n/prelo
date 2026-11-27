// Categories.jsx — Kategori: filter chip responsif memakai query param ?category_id= + grid produk
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil filter kategori aktif dari query URL ?category_id=...
  const selectedId = searchParams.get("category_id") || null;

  // Fetch daftar kategori sekali saat mount
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Fetch produk saat filter kategori berubah
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (selectedId) params.category_id = selectedId;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat produk"))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // Handler pergantian chip kategori yang memperbarui query param URL
  const handleSelectCategory = (id) => {
    if (id) {
      setSearchParams({ category_id: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page">
      {/* Header halaman */}
      <div className="page-header">
        <div>
          <h1>Kategori Gadget</h1>
          <p className="page-subheader">Pilih kategori untuk memfilter unit yang tersedia</p>
        </div>
        <span className="material-symbols-outlined page-header-icon">category</span>
      </div>

      {/* Chip filter kategori (scrollable di mobile, wrap rapi di desktop) */}
      <div className="chip-row">
        <button
          type="button"
          className={`chip ${selectedId === null ? "active" : ""}`}
          onClick={() => handleSelectCategory(null)}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`chip ${selectedId === cat.id ? "active" : ""}`}
            onClick={() => handleSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* State: loading */}
      {loading && (
        <p className="state-msg loading-pulse">
          <span className="material-symbols-outlined">hourglass_top</span>
          Memuat produk kategori...
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
          <span className="material-symbols-outlined">inventory_2</span>
          Tidak ada produk di kategori ini
        </p>
      )}

      {/* Grid produk responsif */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="section-header">
            <h3>Daftar Produk ({products.length})</h3>
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

export default Categories;

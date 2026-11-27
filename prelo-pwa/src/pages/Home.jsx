// Home.jsx — Beranda Prelo (Gaya Desain Modern E-Commerce NovaTech)
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import hpImg from "../assets/hp.png";
import watchImg from "../assets/jam.png";
import laptopImg from "../assets/comp.png";

// Kategori bawaan dengan icon Material Symbols untuk fallback visual cepat
const DEFAULT_CATEGORIES = [
  { id: "phones", name: "Smartphone", icon: "smartphone", count: "30+ Produk" },
  { id: "laptops", name: "Laptop & PC", icon: "laptop_mac", count: "18+ Produk" },
  { id: "tablets", name: "Tablet", icon: "tablet_android", count: "12+ Produk" },
  { id: "audio", name: "Headphone", icon: "headphones", count: "25+ Produk" },
  { id: "accessories", name: "Aksesoris", icon: "watch", count: "40+ Produk" },
  { id: "gaming", name: "Gaming", icon: "sports_esports", count: "15+ Produk" },
];

/**
 * Helper pemilih icon berdasarkan nama kategori
 */
function getCategoryIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("hp") || n.includes("phone") || n.includes("smart")) return "smartphone";
  if (n.includes("laptop") || n.includes("komputer") || n.includes("mac")) return "laptop_mac";
  if (n.includes("tablet") || n.includes("pad")) return "tablet_android";
  if (n.includes("audio") || n.includes("head") || n.includes("tws") || n.includes("sound")) return "headphones";
  if (n.includes("aksesoris") || n.includes("watch") || n.includes("jam")) return "watch";
  if (n.includes("game") || n.includes("gaming") || n.includes("play")) return "sports_esports";
  return "devices";
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter kategori aktif pada halaman home
  const [activeCategory, setActiveCategory] = useState(null);

  // Query pencarian dari URL
  const query = searchParams.get("q") || "";

  // ============================================================
  // COUNTDOWN TIMER (Live Ticking untuk Promo Spesial Hari Ini)
  // ============================================================
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format angka countdown menjadi 2 digit (misal: 07)
  const formatDigit = (num) => String(num).padStart(2, "0");

  // ============================================================
  // FETCH KATEGORI DARI API
  // ============================================================
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c) => ({
            id: c.id,
            name: c.name,
            icon: getCategoryIcon(c.name),
            count: "Tersedia",
          }));
          setCategories(mapped);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
      });
  }, []);

  // ============================================================
  // FETCH PRODUK (Dukungan Pencarian ?q= dan Filter Kategori)
  // ============================================================
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (query) params.q = query;
    if (activeCategory) params.category_id = activeCategory;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat produk"))
      .finally(() => setLoading(false));
  }, [query, activeCategory]);

  // Handler pencarian
  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  // Handler scroll mulus ke area produk
  const scrollToCollection = () => {
    const target = document.getElementById("collection-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-page-container">
      <div className="page home-main-wrapper">
        {/* ========================================================
            4. SPECIAL OFFER BANNER (Live Countdown Timer)
            ======================================================== */}
        <section className="nova-special-offer-banner">
          <div className="special-offer-left">
            <div className="special-offer-badge">
              <span className="material-symbols-outlined">bolt</span>
              <span>Promo Pilihan</span>
            </div>
            <h2 className="special-offer-title">
              Gadget Pilihan <br />
              untuk Setiap Hari
            </h2>
            <p className="special-offer-desc">
              Temukan smartphone, laptop, dan smartwatch pilihan dengan harga terbaik.
            </p>

            <div className="special-feature-stats">
              <div><strong>18</strong><span>Jam</span></div>
              <div><strong>10</strong><span>Merek</span></div>
              <div><strong>56</strong><span>Model</span></div>
              <div><strong>54</strong><span>Toko</span></div>
            </div>

            <button
              type="button"
              className="special-offer-btn"
              onClick={scrollToCollection}
            >
              <span>Belanja Sekarang</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="special-offer-right">
            <div className="special-offer-visual gadget-collage">
              <img src={laptopImg} alt="Laptop" className="collage-laptop" />
              <img src={hpImg} alt="Smartphone" className="collage-phone" />
              <img src={watchImg} alt="Smartwatch" className="collage-watch" />
            </div>
          </div>
        </section>

        {/* ========================================================
            3. BROWSE BY CATEGORY SECTION
            ======================================================== */}
        <section className="nova-category-section">
          <div className="nova-section-header">
            <div>
              <h2 className="nova-section-title">Jelajahi Kategori</h2>
            </div>
            <Link to="/categories" className="nova-view-all-link">
              <span>Semua Kategori</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          <div className="nova-category-grid">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`nova-cat-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setActiveCategory(isSelected ? null : cat.id);
                    scrollToCollection();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="nova-cat-icon-wrap">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <strong className="nova-cat-name">{cat.name}</strong>
                  <span className="nova-cat-count">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            5. EXPLORE OUR BEST SELLERS SECTION
            ======================================================== */}
        <section id="collection-section" className="nova-collection-section">
          <div className="nova-section-header collection-header">
            <div>
              <span className="nova-section-tag">
                <span className="material-symbols-outlined">local_fire_department</span>
                Koleksi Gadget
              </span>
              <h2 className="nova-section-title">
                {query
                  ? `Hasil Pencarian: "${query}"`
                  : activeCategory
                    ? "Kategori Terpilih"
                    : "Produk Terlaris Pilihan"}
              </h2>
            </div>
            <Link to="/categories" className="nova-view-all-link">
              <span>Katalog Lengkap</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          {/* Kotak Pencarian Produk */}
          <div className="home-search-bar-wrap">
            <div className="home-search-input-box">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                className="home-search-input"
                placeholder="Cari gadget (iPhone 13, MacBook M1, Samsung S23, TWS)..."
                value={query}
                onChange={handleSearch}
              />
              {query && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchParams({})}
                  title="Hapus pencarian"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {/* Tombol Reset Filter jika sedang memfilter */}
            {activeCategory && (
              <button
                type="button"
                className="category-reset-btn"
                onClick={() => setActiveCategory(null)}
              >
                <span>Hapus Filter Kategori</span>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Status Loading */}
          {loading && (
            <div className="state-msg loading-pulse">
              <span className="material-symbols-outlined">hourglass_top</span>
              <span>Memuat koleksi gadget...</span>
            </div>
          )}

          {/* Status Error */}
          {error && (
            <div className="state-msg error">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Status Kosong */}
          {!loading && !error && products.length === 0 && (
            <div className="state-msg">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>
                {query
                  ? `Gadget "${query}" tidak ditemukan. Coba kata kunci lain.`
                  : "Belum ada produk untuk kategori ini."}
              </span>
            </div>
          )}

          {/* Grid Koleksi Produk */}
          {!loading && !error && products.length > 0 && (
            <div className="product-grid nova-product-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onDelete={(id) => setProducts((prev) => prev.filter((item) => item.id !== id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================
            6. TRUST & VALUE PROPOSITION BAR (4 Pilar Prelo)
            ======================================================== */}
        <section className="nova-trust-features-bar">
          <div className="trust-feature-col">
            <div className="trust-feat-icon-box">
              <span className="material-symbols-outlined">fact_check</span>
            </div>
            <div className="trust-feat-text">
              <strong>Inspeksi Unit Teruji</strong>
              <span>Kondisi fisik, baterai & minus dijelaskan transparan</span>
            </div>
          </div>

          <div className="trust-feature-col">
            <div className="trust-feat-icon-box">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div className="trust-feat-text">
              <strong>Garansi 30 Hari</strong>
              <span>Jaminan uang kembali jika unit tidak sesuai</span>
            </div>
          </div>

          <div className="trust-feature-col">
            <div className="trust-feat-icon-box">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div className="trust-feat-text">
              <strong>Transaksi 100% Aman</strong>
              <span>Sistem rekening bersama terenkripsi</span>
            </div>
          </div>

          <div className="trust-feature-col">
            <div className="trust-feat-icon-box">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div className="trust-feat-text">
              <strong>Dukungan 24/7</strong>
              <span>Layanan inspeksi & bantuan tim CS</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
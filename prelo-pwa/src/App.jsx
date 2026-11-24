// App.jsx — routing utama & layout responsif untuk mobile dan web
import { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Sell from "./pages/Sell";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import EditProduct from "./pages/EditProduct";
import Onboarding from "./pages/Onboarding";
import logoImg from "./assets/logo.png";

// Header atas: menampilkan logo dan navigasi desktop pada layar web/desktop
function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`app-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Brand logo — hanya logo tanpa teks tambahan */}
        <Link to="/" className="brand-logo" aria-label="Prelo">
          <img src={logoImg} alt="Prelo" className="brand-logo-img" />
        </Link>

        {/* Navigasi Desktop — otomatis tampil pada layar web (>= 768px) */}
        <nav className="desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `desktop-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">storefront</span>
            <span>Beranda</span>
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `desktop-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">category</span>
            <span>Kategori</span>
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `desktop-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">favorite</span>
            <span>Favorit</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `desktop-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">person</span>
            <span>Profil</span>
          </NavLink>
          <NavLink to="/sell" className="desktop-sell-btn">
            <span className="material-symbols-outlined">add</span>
            <span>Jual Gadget</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

// Status in-memory agar onboarding selalu tampil saat masuk ke web di lokal / saat di-refresh
let hasSeenSplashInSession = false;

function App() {
  const location = useLocation();
  const isOnboardingRoute = location.pathname === "/onboarding";

  // State splash onboarding otomatis saat web pertama kali dibuka di lokal
  const [showSplash, setShowSplash] = useState(() => {
    if (isOnboardingRoute) return false;
    return !hasSeenSplashInSession;
  });

  // Deteksi status koneksi jaringan (Online / Offline Caching)
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSplashDone = () => {
    hasSeenSplashInSession = true;
    setShowSplash(false);
  };

  return (
    <div className="app-wrapper">
      {/* Tampilkan Onboarding Splash saat pertama kali masuk lokal */}
      {showSplash && <Onboarding onComplete={handleSplashDone} />}

      {/* Indikator Mode Offline (Query Cache Aktif) */}
      {!isOnline && (
        <div className="offline-banner">
          <span className="material-symbols-outlined">wifi_off</span>
          <span>Mode Offline Aktif — Menggunakan Query Cache Service Worker</span>
        </div>
      )}

      {/* Sembunyikan header di halaman onboarding untuk pengalaman imersif */}
      {!isOnboardingRoute && <Header />}

      {/* Konten rute utama */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product/:id/edit" element={<EditProduct />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>

      {/* Sembunyikan navigasi bawah saat di halaman onboarding */}
      {!isOnboardingRoute && <BottomNav />}
    </div>
  );
}

export default App;

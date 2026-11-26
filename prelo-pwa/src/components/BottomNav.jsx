// BottomNav.jsx — navigasi bawah 5 tab, desain premium dengan tombol Jual raised
import { NavLink } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {/* Tab Beranda */}
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="material-symbols-outlined">storefront</span>
        <span>Beranda</span>
      </NavLink>

      {/* Tab Kategori */}
      <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="material-symbols-outlined">category</span>
        <span>Kategori</span>
      </NavLink>

      {/* Tab Jual — tombol menonjol di tengah */}
      <NavLink to="/sell" className={({ isActive }) => `nav-item-raised ${isActive ? "active" : ""}`}>
        <span className="nav-raised-btn" aria-label="Jual Gadget">
          <svg
            className="nav-plus-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        <span className="nav-label">Jual</span>
      </NavLink>

      {/* Tab Favorit */}
      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="material-symbols-outlined">favorite</span>
        <span>Favorit</span>
      </NavLink>

      {/* Tab Profil */}
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="material-symbols-outlined">person</span>
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;

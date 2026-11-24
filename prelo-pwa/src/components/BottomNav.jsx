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
        <span className="nav-raised-btn">
          <span className="material-symbols-outlined">add</span>
        </span>
        <span>Jual</span>
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

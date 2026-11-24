// Profile.jsx — Halaman Profil Pengguna (Edit Nama, Bio, & Foto Profil)
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { rupiah, PLACEHOLDER_IMG } from "../services/utils";
import logoImg from "../assets/logo.png";

// Profil default: cukup nama, bio, dan avatar
const DEFAULT_PROFILE = {
  name: "Vennanda Az Zahra Putri",
  bio: "Mahasiswa Teknik Komputer Undip & penjual gadget terpercaya di Prelo.",
  avatar: "" // string data URL base64, kosong = default avatar icon
};

/**
 * Kompresi gambar profil menggunakan HTML5 Canvas
 * Mengubah gambar ke rasio persegi 360x360 agar hemat memori & cepat disimpan di localStorage.
 */
function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const SIZE = 360;
        let width = img.width;
        let height = img.height;

        // Center-crop ke rasio 1:1
        let sx = 0;
        let sy = 0;
        let sSize = Math.min(width, height);

        if (width > height) {
          sx = Math.round((width - height) / 2);
        } else {
          sy = Math.round((height - width) / 2);
        }

        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, SIZE, SIZE);

        // Kompresi ke format JPEG kualitas 0.72
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.72);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Profile() {
  // State data profil
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("prelo_user_profile");
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback jika json parse gagal
    }
    return DEFAULT_PROFILE;
  });

  // State mode edit profil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // State toggle accordion "Tentang Aplikasi (About)"
  const [showAbout, setShowAbout] = useState(true);

  // State Arsip / Tempat Sampah Soft Delete
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [archiveError, setArchiveError] = useState("");

  const fileInputRef = useRef(null);

  // Auto-dismiss toast setelah 3 detik
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load produk yang telah di-soft delete
  const loadArchivedProducts = () => {
    setLoadingArchived(true);
    setArchiveError("");
    api
      .get("/products", { params: { archived: true } })
      .then((res) => {
        setArchivedProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setArchiveError(
          err.response?.data?.error || "Gagal memuat daftar produk terhapus."
        );
      })
      .finally(() => setLoadingArchived(false));
  };

  const handleOpenArchived = () => {
    setShowArchivedModal(true);
    loadArchivedProducts();
  };

  // Handler memulihkan (restore) produk yang di-soft-delete
  const handleRestoreProduct = async (id) => {
    setRestoringId(id);
    try {
      await api.patch(`/products/${id}/restore`);
      setArchivedProducts((prev) => prev.filter((p) => p.id !== id));
      setToastMessage("Produk berhasil dipulihkan dan kembali aktif di katalog!");
    } catch (err) {
      alert(err.response?.data?.error || "Gagal memulihkan produk.");
    } finally {
      setRestoringId(null);
    }
  };

  // Handler membuka mode edit
  const handleStartEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  // Handler pembatalan edit
  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  // Handler pemilihan file foto profil
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas foto / gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 10 MB.");
      return;
    }

    setIsProcessingAvatar(true);
    try {
      const compressed = await compressAvatar(file);
      setEditForm((prev) => ({ ...prev, avatar: compressed }));
      // Jika di luar mode edit form, langsung simpan foto profil
      if (!isEditing) {
        const updated = { ...profile, avatar: compressed };
        setProfile(updated);
        localStorage.setItem("prelo_user_profile", JSON.stringify(updated));
        setToastMessage("Foto profil berhasil diperbarui!");
      }
    } catch (err) {
      console.error("Gagal memproses gambar avatar:", err);
      alert("Gagal memproses gambar. Coba gambar lain.");
    } finally {
      setIsProcessingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handler menghapus foto profil
  const handleRemoveAvatar = () => {
    if (window.confirm("Hapus foto profil dan gunakan avatar bawaan?")) {
      setEditForm((prev) => ({ ...prev, avatar: "" }));
      if (!isEditing) {
        const updated = { ...profile, avatar: "" };
        setProfile(updated);
        localStorage.setItem("prelo_user_profile", JSON.stringify(updated));
        setToastMessage("Foto profil berhasil dihapus.");
      }
    }
  };

  // Handler simpan form edit: Cukup Nama dan Bio saja
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      alert("Nama tidak boleh kosong.");
      return;
    }

    const updated = {
      ...profile,
      name: editForm.name.trim(),
      bio: editForm.bio.trim(),
      avatar: editForm.avatar
    };

    setProfile(updated);
    try {
      localStorage.setItem("prelo_user_profile", JSON.stringify(updated));
    } catch (err) {
      console.error("Gagal menyimpan ke localStorage:", err);
    }

    setIsEditing(false);
    setToastMessage("Profil berhasil disimpan!");
  };

  return (
    <div className="page">
      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="profile-toast">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="page-header">
        <div>
          <h1>Akun & Profil</h1>
          <p className="page-subheader">Kelola nama, bio, dan foto profil Prelo</p>
        </div>
        <span className="material-symbols-outlined page-header-icon">account_circle</span>
      </div>

      {/* Hidden file input untuk upload gambar profil */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarFileChange}
      />

      <div className="profile-container">
        {/* ========================================================
            1. KARTU PROFIL PENGGUNA (MODE VIEW / MODE EDIT)
            ======================================================== */}
        {!isEditing ? (
          // MODE VIEW TAMPILAN PROFIL
          <div className="user-profile-card">
            {/* Foto Profil & Tombol Ganti */}
            <div className="user-avatar-wrapper">
              <div
                className="user-avatar"
                onClick={() => fileInputRef.current?.click()}
                title="Klik untuk mengganti foto profil"
                role="button"
                tabIndex={0}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="user-avatar-img"
                  />
                ) : (
                  <span className="material-symbols-outlined user-avatar-icon">person</span>
                )}
                {/* Tombol Kamera Mengambang */}
                <div className="avatar-camera-overlay" title="Ubah Foto">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
              </div>
              <span className="user-verified-badge" title="Akun Terverifikasi">
                <span className="material-symbols-outlined">verified</span>
              </span>
            </div>

            {/* Detail Informasi Pengguna: Cukup Nama dan Bio */}
            <div className="user-details">
              <div className="user-details-top">
                <h2 className="user-name">{profile.name}</h2>
                <button
                  type="button"
                  className="profile-edit-toggle-btn"
                  onClick={handleStartEdit}
                >
                  <span className="material-symbols-outlined">edit</span>
                  <span>Edit Profil</span>
                </button>
              </div>

              {/* Bio Pengguna */}
              {profile.bio && (
                <p className="user-bio-text">{profile.bio}</p>
              )}

              {/* Tag Status */}
              <div className="user-tags">
                <span className="user-tag verified">
                  <span className="material-symbols-outlined">shield</span>
                  Pengguna Terverifikasi
                </span>
                <span className="user-tag seller">
                  <span className="material-symbols-outlined">storefront</span>
                  Penjual Terpercaya
                </span>
              </div>
            </div>
          </div>
        ) : (
          // MODE FORM EDIT PROFIL (Cukup Nama, Bio, & Foto Profil)
          <form className="profile-edit-card" onSubmit={handleSaveProfile}>
            <div className="edit-card-header">
              <div className="edit-header-title">
                <span className="material-symbols-outlined">edit_note</span>
                <h3>Edit Profil Saya</h3>
              </div>
              <button
                type="button"
                className="edit-close-btn"
                onClick={handleCancelEdit}
                title="Batal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Bagian Ubah Foto Profil */}
            <div className="edit-avatar-section">
              <div className="edit-avatar-preview-wrap">
                <div className="edit-avatar-preview">
                  {editForm.avatar ? (
                    <img
                      src={editForm.avatar}
                      alt="Preview Foto"
                      className="user-avatar-img"
                    />
                  ) : (
                    <span className="material-symbols-outlined edit-placeholder-icon">person</span>
                  )}
                  {isProcessingAvatar && (
                    <div className="avatar-loading-overlay">
                      <span className="material-symbols-outlined spin-icon">sync</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="edit-avatar-actions">
                <button
                  type="button"
                  className="avatar-change-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingAvatar}
                >
                  <span className="material-symbols-outlined">upload</span>
                  <span>{editForm.avatar ? "Ganti Foto" : "Unggah Foto Profil"}</span>
                </button>
                {editForm.avatar && (
                  <button
                    type="button"
                    className="avatar-remove-btn"
                    onClick={handleRemoveAvatar}
                  >
                    <span className="material-symbols-outlined">delete</span>
                    <span>Hapus Foto</span>
                  </button>
                )}
                <span className="edit-avatar-hint">Format JPG/PNG, otomatis dikompresi</span>
              </div>
            </div>

            {/* Input Form: Cukup Nama dan Bio saja */}
            <div className="edit-fields-grid single-col">
              <div className="edit-field-group">
                <label htmlFor="profileName" className="edit-field-label">
                  Nama <span className="req">*</span>
                </label>
                <div className="edit-input-wrapper">
                  <span className="material-symbols-outlined field-icon">badge</span>
                  <input
                    id="profileName"
                    type="text"
                    className="edit-field-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Masukkan nama"
                    required
                  />
                </div>
              </div>

              <div className="edit-field-group">
                <label htmlFor="profileBio" className="edit-field-label">
                  Bio
                </label>
                <textarea
                  id="profileBio"
                  rows={3}
                  className="edit-field-textarea"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tuliskan bio profil kamu..."
                />
              </div>
            </div>

            {/* Tombol Aksi Form */}
            <div className="edit-actions-row">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={handleCancelEdit}
              >
                Batal
              </button>
              <button
                type="submit"
                className="edit-save-btn"
                disabled={isProcessingAvatar}
              >
                <span className="material-symbols-outlined">save</span>
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            2. MENU PINTASAN AKUN PRELO
            ======================================================== */}
        <div className="profile-menu-section">
          <h3 className="profile-section-title">Menu Cepat</h3>
          <div className="profile-menu-list">
            <Link to="/sell" className="profile-menu-item">
              <div className="menu-icon-box primary">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div className="menu-text">
                <strong>Jual Gadget Baru</strong>
                <span>Pasang iklan gadget second milikmu</span>
              </div>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/favorites" className="profile-menu-item">
              <div className="menu-icon-box pink">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <div className="menu-text">
                <strong>Gadget Favorit</strong>
                <span>Lihat barang yang telah kamu simpan</span>
              </div>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/categories" className="profile-menu-item">
              <div className="menu-icon-box secondary">
                <span className="material-symbols-outlined">category</span>
              </div>
              <div className="menu-text">
                <strong>Katalog Kategori</strong>
                <span>Jelajahi HP, Laptop, Tablet, & Aksesoris</span>
              </div>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/onboarding" className="profile-menu-item">
              <div className="menu-icon-box primary">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div className="menu-text">
                <strong>Panduan Aplikasi</strong>
                <span>Buka kembali panduan dan fitur Prelo</span>
              </div>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            {/* Menu Khusus: Produk Terhapus */}
            <button
              type="button"
              className="profile-menu-item btn-menu-archived"
              onClick={handleOpenArchived}
            >
              <div className="menu-icon-box orange">
                <span className="material-symbols-outlined">delete_sweep</span>
              </div>
              <div className="menu-text">
                <strong>Produk Terhapus</strong>
                <span>Lihat & pulihkan produk yang pernah dihapus</span>
              </div>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            3. BAGIAN ABOUT / TENTANG APLIKASI PRELO
            ======================================================== */}
        <div className="about-section-card">
          <div
            className="about-header"
            onClick={() => setShowAbout(!showAbout)}
            role="button"
            tabIndex={0}
          >
            <div className="about-header-left">
              <span className="material-symbols-outlined about-title-icon">info</span>
              <div>
                <h3>Tentang Prelo</h3>
                <p>Informasi platform, visi, dan teknologi aplikasi</p>
              </div>
            </div>
            <span className={`material-symbols-outlined about-toggle-icon ${showAbout ? "open" : ""}`}>
              expand_more
            </span>
          </div>

          {showAbout && (
            <div className="about-body">
              {/* Logo Prelo */}
              <div className="about-logo-center">
                <img src={logoImg} alt="Prelo Logo" className="about-logo-img" />
              </div>

              {/* Deskripsi Aplikasi */}
              <div className="about-desc-box">
                <h4>Jual Beli Gadget Bekas Terpercaya</h4>
                <p>
                  <strong>Prelo</strong> adalah aplikasi Progressive Web App (PWA)
                  marketplace khusus gadget bekas berkualitas. Menghubungkan pembeli
                  dan penjual smartphone, laptop, tablet, serta aksesoris dengan
                  standar inspeksi unit yang transparan dan perlindungan transaksi yang aman.
                </p>
              </div>

              {/* Nilai Utama / Fitur */}
              <div className="about-features-grid">
                <div className="feature-item">
                  <span className="material-symbols-outlined">verified_user</span>
                  <div>
                    <strong>Inspeksi Teruji</strong>
                    <span>Kondisi baterai & fisik jelas</span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="material-symbols-outlined">lock</span>
                  <div>
                    <strong>Transaksi Aman</strong>
                    <span>Jaminan keaslian IMEI & garansi</span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="material-symbols-outlined">bolt</span>
                  <div>
                    <strong>Cepat & Mudah</strong>
                    <span>Jual dan beli dalam hitungan menit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL ARSIP & SOFT DELETE PRODUK
          ======================================================== */}
      {showArchivedModal && (
        <div
          className="soft-delete-modal-backdrop"
          onClick={() => setShowArchivedModal(false)}
        >
          <div
            className="soft-delete-modal-card archived-products-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="archived-modal-header">
              <div className="archived-header-title">
                <span className="material-symbols-outlined header-icon">delete_sweep</span>
                <div>
                  <h3>Produk Terhapus</h3>
                  <p>Daftar produk yang telah dihapus dari katalog</p>
                </div>
              </div>
              <button
                type="button"
                className="edit-close-btn"
                onClick={() => setShowArchivedModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="archived-modal-body">
              {loadingArchived ? (
                <div className="state-msg loading-pulse">
                  <span className="material-symbols-outlined">hourglass_top</span>
                  Memuat produk terhapus...
                </div>
              ) : archiveError ? (
                <div className="modal-error-alert">
                  <span className="material-symbols-outlined">error</span>
                  <span>{archiveError}</span>
                </div>
              ) : archivedProducts.length === 0 ? (
                <div className="archived-empty-state">
                  <span className="material-symbols-outlined empty-icon">delete_sweep</span>
                  <h4>Tempat Sampah Kosong</h4>
                  <p>Tidak ada produk yang dihapus. Semua produk Anda aktif di katalog.</p>
                </div>
              ) : (
                <div className="archived-list">
                  {archivedProducts.map((item) => (
                    <div key={item.id} className="archived-item-card">
                      <div className="archived-item-img-wrap">
                        <img
                          src={item.image_url || PLACEHOLDER_IMG}
                          alt={item.name}
                          className="archived-item-img"
                        />
                      </div>

                      <div className="archived-item-info">
                        <h4 className="archived-item-name">{item.name}</h4>
                        <span className="archived-item-price">{rupiah(item.price)}</span>
                        <div className="archived-item-meta">
                          <span className="badge-deleted">
                            <span className="material-symbols-outlined">history</span>
                            Terhapus
                          </span>
                        </div>
                      </div>

                      <div className="archived-item-actions">
                        <button
                          type="button"
                          className="btn-restore-item"
                          onClick={() => handleRestoreProduct(item.id)}
                          disabled={restoringId === item.id}
                        >
                          {restoringId === item.id ? (
                            <>
                              <span className="material-symbols-outlined spin-icon">sync</span>
                              <span>Memulihkan...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">restore_from_trash</span>
                              <span>Pulihkan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="archived-modal-footer">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={() => setShowArchivedModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
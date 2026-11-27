// ProductCard.jsx — kartu produk premium bergaya modern NovaTech dengan aksi Share & Hapus
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { rupiah, PLACEHOLDER_IMG } from "../services/utils";

function ProductCard({ product, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Jika produk telah dihapus dari state, sembunyikan kartu
  if (isDeleted) return null;

  // Handler Bagikan Link Produk (Web Share API di HP / Salin Link di Desktop)
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/${product.id}`;
    const shareData = {
      title: product.name,
      text: `Lihat ${product.name} di Prelo - Marketplace Gadget Bekas Terpercaya!`,
      url: productUrl,
    };

    // 1. Coba Web Share API (native share di browser HP)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // 2. Fallback: Salin ke Clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = productUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Salin link produk ini:", productUrl);
    }
  };

  // Handler Buka Modal Konfirmasi Hapus
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Handler Eksekusi Soft Delete
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await api.delete(`/products/${product.id}`);
      setIsDeleted(true);
      setShowDeleteModal(false);
      if (typeof onDelete === "function") {
        onDelete(product.id);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Gagal menghapus produk.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Link to={`/product/${product.id}`} className="product-card nova-card">
        {/* Gambar produk dengan tombol aksi cepat (Share & Hapus) */}
        <div className="card-img-wrapper">
          <img
            src={product.image_url || PLACEHOLDER_IMG}
            alt={product.name}
            loading="lazy"
          />

          {/* Tombol Aksi Cepat: Share Link & Hapus Produk */}
          <div className="card-floating-actions">
            {/* Tombol Share Link */}
            <button
              type="button"
              className={`card-quick-btn share ${copied ? "copied" : ""}`}
              onClick={handleShare}
              title={copied ? "Link Tersalin!" : "Bagikan Link Produk"}
              aria-label="Bagikan link produk"
            >
              <span className="material-symbols-outlined">
                {copied ? "check" : "share"}
              </span>
            </button>

            {/* Tombol Hapus Produk */}
            <button
              type="button"
              className="card-quick-btn delete"
              onClick={handleDeleteClick}
              title="Hapus Produk"
              aria-label="Hapus produk"
            >
              <span className="material-symbols-outlined">delete_outline</span>
            </button>
          </div>

          {/* Toast notifikasi saat link disalin */}
          {copied && (
            <div className="card-share-toast">
              Link Tersalin!
            </div>
          )}
        </div>

        <div className="card-body">
          <div className="card-meta">
            {product.brand || "Gadget"} &bull; {product.condition}
          </div>

          <h3 className="card-name" title={product.name}>
            {product.name}
          </h3>

          {/* Rating Bintang Bintang E-Commerce */}
          <div className="card-rating-row">
            <div className="stars-wrap">
              <span className="material-symbols-outlined star-icon filled">star</span>
              <span className="material-symbols-outlined star-icon filled">star</span>
              <span className="material-symbols-outlined star-icon filled">star</span>
              <span className="material-symbols-outlined star-icon filled">star</span>
              <span className="material-symbols-outlined star-icon filled">star</span>
            </div>
            <span className="rating-count">(48)</span>
          </div>

          {/* Harga & Tombol Cek Detail */}
          <div className="card-bottom-row">
            <div className="card-price-group">
              <span className="card-price">{rupiah(product.price)}</span>
              <span className={`card-sub ${Number(product.stock) === 0 ? "card-stock-empty" : ""}`}>
                {Number(product.stock) === 0 ? "Stok Habis" : `Stok ${product.stock ?? 1} unit`}
              </span>
            </div>
            <div className="card-action-btn" title="Lihat Detail Unit">
              <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Modal Konfirmasi Soft Delete */}
      {showDeleteModal && (
        <div
          className="soft-delete-modal-backdrop"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDeleting) setShowDeleteModal(false);
          }}
        >
          <div
            className="soft-delete-modal-card card-delete-modal-inner"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="modal-header-icon-wrap">
              <div className="modal-icon-circle danger">
                <span className="material-symbols-outlined">delete_forever</span>
              </div>
            </div>

            <h3 className="modal-title" style={{ textAlign: "center" }}>Hapus Produk Ini?</h3>
            <p className="modal-desc" style={{ textAlign: "center", marginBottom: "20px" }}>
              Apakah Anda yakin ingin menghapus <strong>"{product.name}"</strong>? Produk akan dipindahkan ke tempat sampah (soft delete) dan tidak akan tampil di katalog.
            </p>

            <div className="modal-actions-row">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn delete"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;

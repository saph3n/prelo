// ProductDetail.jsx — Detail produk: tata letak responsif 2 kolom di web, 1 kolom di mobile
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { rupiah, PLACEHOLDER_IMG, isFavorite, toggleFavorite } from "../services/utils";

// Review bawaan awal jika belum ada review tersimpan
const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    name: "Dimas Pratama",
    rating: 5,
    date: "Kemarin",
    comment: "Unit mulus pol no minus, baterai masih sangat awet. Pengiriman cepat dan penjual ramah banget!",
    verified: true,
  },
  {
    id: "rev-2",
    name: "Siti Aisyah",
    rating: 5,
    date: "3 hari lalu",
    comment: "Sesuai ekspektasi dan deskripsi. Layar bersih jernih, tombol-tombol responsif. Penjual sangat direkomendasikan di Prelo!",
    verified: true,
  },
  {
    id: "rev-3",
    name: "Rian Hidayat",
    rating: 4,
    date: "1 minggu lalu",
    comment: "Barang bagus berfungsi lancar semua. Ada lecet pemakaian tipis wajar sesuai yang tertera di foto. Puas!",
    verified: true,
  },
];

const RATING_LABELS = {
  1: "1 - Sangat Buruk",
  2: "2 - Kurang Puas",
  3: "3 - Cukup Baik",
  4: "4 - Puas & Bagus",
  5: "5 - Sangat Puas!",
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fav, setFav] = useState(false);

  // State untuk Hapus Produk
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // State untuk Atur Stok
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockInput, setStockInput] = useState(1);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Sinkronisasi nilai awal stok
  useEffect(() => {
    if (product) {
      setStockInput(product.stock ?? 1);
    }
  }, [product]);

  // Handler simpan perubahan stok
  const handleSaveStock = async (e) => {
    if (e) e.preventDefault();
    const newStock = Math.max(0, parseInt(stockInput, 10) || 0);
    setIsUpdatingStock(true);
    try {
      await api.put(`/products/${id}`, { stock: newStock });
      setProduct((prev) => ({ ...prev, stock: newStock }));
      setShowStockModal(false);
      setReviewToast(`Stok berhasil diatur menjadi ${newStock} unit!`);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Gagal memperbarui stok");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // ========================================================
  // STATE PENILAIAN (RATE) & ULASAN (REVIEW)
  // ========================================================
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`prelo_reviews_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_REVIEWS;
  });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Default nama reviewer dari profil pengguna jika ada
  const [reviewerName, setReviewerName] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("prelo_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) return parsed.name;
      }
    } catch {
      // Fallback
    }
    return "";
  });

  const [reviewComment, setReviewComment] = useState("");
  const [reviewToast, setReviewToast] = useState("");

  // Auto-dismiss toast ulasan
  useEffect(() => {
    if (reviewToast) {
      const t = setTimeout(() => setReviewToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [reviewToast]);

  // Hitung rata-rata rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + Number(curr.rating || 5), 0) /
          reviews.length
        ).toFixed(1)
      : "5.0";

  // Fetch detail produk
  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setFav(isFavorite(res.data.id));
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal memuat detail produk";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Toggle favorit
  const handleFav = () => {
    if (product) {
      const newStatus = toggleFavorite(product.id);
      setFav(newStatus);
    }
  };

  // Handler Hapus Produk
  const handleConfirmSoftDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/products/${id}`);
      setDeleteSuccess(true);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal menghapus produk. Coba lagi.";
      setDeleteError(errMsg);
      setIsDeleting(false);
    }
  };

  // Handler Submit Ulasan & Rating Baru
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert("Silakan masukkan komentar ulasan Anda.");
      return;
    }

    const nameToUse = reviewerName.trim() || "Pembeli Prelo";
    const newEntry = {
      id: `rev-${Date.now()}`,
      name: nameToUse,
      rating: newRating,
      date: "Baru saja",
      comment: reviewComment.trim(),
      verified: true,
      isUserReview: true,
    };

    const updated = [newEntry, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`prelo_reviews_${id}`, JSON.stringify(updated));
    } catch {
      // Ignored
    }

    setReviewComment("");
    setShowReviewForm(false);
    setReviewToast("Ulasan dan rating Anda berhasil dikirim!");
  };

  // State: loading
  if (loading) {
    return (
      <div className="page">
        <p className="state-msg loading-pulse">
          <span className="material-symbols-outlined">hourglass_top</span>
          Memuat detail gadget...
        </p>
      </div>
    );
  }

  // State: error
  if (error) {
    return (
      <div className="page">
        <p className="state-msg error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </p>
        <button
          className="btn btn-outline btn-block mt-md"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Kembali
        </button>
      </div>
    );
  }

  // State: tidak ditemukan
  if (!product) {
    return (
      <div className="page">
        <p className="state-msg">
          <span className="material-symbols-outlined">search_off</span>
          Produk tidak ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Toast Notifikasi Review */}
      {reviewToast && (
        <div className="detail-review-toast">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{reviewToast}</span>
        </div>
      )}

      {/* Tombol kembali */}
      <div className="detail-top-nav">
        <button
          className="btn btn-outline back-btn"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Kembali</span>
        </button>
      </div>

      {/* Kontainer detail produk responsif */}
      <div className="detail-layout">
        {/* Kolom kiri: Media / Foto */}
        <div className="detail-media">
          <div className="detail-img-container">
            <img
              className="detail-img"
              src={product.image_url || PLACEHOLDER_IMG}
              alt={product.name}
            />
          </div>
        </div>

        {/* Kolom kanan: Info lengkap & Aksi */}
        <div className="detail-content">
          <h1 className="detail-name">{product.name}</h1>

          {/* Rating Bintang & Review Teratas */}
          <div className="detail-rating-row">
            <div className="stars-wrap">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`material-symbols-outlined star-icon ${
                    s <= Math.round(avgRating) ? "filled" : ""
                  }`}
                >
                  star
                </span>
              ))}
            </div>
            <span className="detail-rating-score">{avgRating}</span>
            <span className="detail-rating-count">
              ({reviews.length} Ulasan Pembeli)
            </span>
          </div>

          <p className="detail-price">{rupiah(product.price)}</p>

          {/* Badges info produk */}
          <div className="detail-info">
            <span className="detail-badge">
              <span className="material-symbols-outlined">devices</span>
              {product.brand || "Gadget"}
            </span>
            <span className="detail-badge">
              <span className="material-symbols-outlined">grade</span>
              {product.condition || "Bekas normal"}
            </span>
            {product.categories && (
              <span className="detail-badge">
                <span className="material-symbols-outlined">category</span>
                {product.categories.name}
              </span>
            )}
            <span className={`detail-badge ${Number(product.stock) === 0 ? "badge-out-of-stock" : ""}`}>
              <span className="material-symbols-outlined">
                {Number(product.stock) === 0 ? "warning" : "inventory"}
              </span>
              {Number(product.stock) === 0 ? "Stok Habis (0 Unit)" : `Stok: ${product.stock ?? 1} unit`}
            </span>
          </div>

          {/* Deskripsi produk */}
          {product.description && (
            <div className="detail-desc-card">
              <h4 className="detail-section-title">Deskripsi & Kondisi</h4>
              <p className="detail-desc">{product.description}</p>
            </div>
          )}

          {/* Tombol aksi: Favorit, Beri Rating, Atur Stok, Edit, & Hapus */}
          <div className="detail-action-buttons">
            <button
              className={`btn btn-block ${fav ? "btn-fav active" : "btn-fav"}`}
              onClick={handleFav}
            >
              <span className="material-symbols-outlined">
                {fav ? "heart_minus" : "favorite"}
              </span>
              <span>{fav ? "Hapus dari Favorit" : "Simpan ke Favorit"}</span>
            </button>

            {/* Tombol Atur Stok Unit */}
            <button
              type="button"
              className="btn-stock-adjust"
              onClick={() => {
                setStockInput(product.stock ?? 1);
                setShowStockModal(true);
              }}
              title="Atur jumlah stok barang ini"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Atur Stok Unit ({product.stock ?? 1})</span>
            </button>

            {/* Tombol Tulis Review Cepat */}
            <button
              type="button"
              className="btn-review-toggle"
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                // Scroll halus ke form review
                setTimeout(() => {
                  const target = document.getElementById("reviews-section");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <span className="material-symbols-outlined">rate_review</span>
              <span>{showReviewForm ? "Tutup Form Ulasan" : "Beri Rating & Ulasan"}</span>
            </button>

            {/* Tombol Edit Produk */}
            <button
              type="button"
              className="btn-edit-product"
              onClick={() => navigate(`/product/${id}/edit`)}
              title="Edit informasi produk ini"
            >
              <span className="material-symbols-outlined">edit</span>
              <span>Edit Produk</span>
            </button>

            {/* Tombol Hapus Produk */}
            <button
              type="button"
              className="btn-soft-delete"
              onClick={() => setShowDeleteModal(true)}
              title="Hapus produk ini"
            >
              <span className="material-symbols-outlined">delete_outline</span>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          BAGIAN RATE & REVIEW (ULASAN & PENILAIAN PEMBELI)
          ======================================================== */}
      <section id="reviews-section" className="detail-reviews-section">
        <div className="reviews-card-header">
          <div className="reviews-title-box">
            <div className="reviews-badge-icon">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div>
              <h3 className="reviews-heading">Penilaian & Ulasan Pembeli</h3>
              <p className="reviews-subheading">
                Ulasan nyata dari pembeli yang telah membeli gadget ini
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-add-review-pill"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <span className="material-symbols-outlined">
              {showReviewForm ? "close" : "add_comment"}
            </span>
            <span>{showReviewForm ? "Batal" : "Tulis Ulasan"}</span>
          </button>
        </div>

        {/* Ringkasan Skor Rating */}
        <div className="reviews-summary-box">
          <div className="summary-score-col">
            <div className="summary-big-score">{avgRating}</div>
            <div className="summary-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`material-symbols-outlined star-icon ${
                    s <= Math.round(avgRating) ? "filled" : ""
                  }`}
                >
                  star
                </span>
              ))}
            </div>
            <div className="summary-total-text">{reviews.length} Ulasan Terverifikasi</div>
          </div>

          <div className="summary-badges-col">
            <div className="review-trust-pill">
              <span className="material-symbols-outlined">verified</span>
              <span>100% Unit Sesuai Deskripsi</span>
            </div>
            <div className="review-trust-pill">
              <span className="material-symbols-outlined">thumb_up</span>
              <span>Penjual Ramah & Amanah</span>
            </div>
            <div className="review-trust-pill">
              <span className="material-symbols-outlined">shield_check</span>
              <span>Pengemasan Aman & Rapi</span>
            </div>
          </div>
        </div>

        {/* FORMULIR TULIS RATE & REVIEW (Jika dibuka) */}
        {showReviewForm && (
          <form className="review-form-container" onSubmit={handleSubmitReview}>
            <h4 className="form-title">
              <span className="material-symbols-outlined">edit_note</span>
              Tulis Penilaian Anda
            </h4>

            {/* Pemilih Bintang Interaktif */}
            <div className="star-picker-group">
              <label className="picker-label">Pilih Rating Bintang:</label>
              <div className="interactive-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`interactive-star-btn ${
                      star <= (hoverRating || newRating) ? "active" : ""
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                    title={`${star} Bintang`}
                  >
                    <span className="material-symbols-outlined">star</span>
                  </button>
                ))}
                <span className="rating-feedback-badge">
                  {RATING_LABELS[hoverRating || newRating]}
                </span>
              </div>
            </div>

            {/* Input Nama Pengulas */}
            <div className="review-input-group">
              <label htmlFor="reviewerName" className="review-input-label">
                Nama Anda:
              </label>
              <input
                id="reviewerName"
                type="text"
                className="review-text-input"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Contoh: Vennanda"
                required
              />
            </div>

            {/* Input Komentar Ulasan */}
            <div className="review-input-group">
              <label htmlFor="reviewComment" className="review-input-label">
                Ulasan Produk & Pelayanan:
              </label>
              <textarea
                id="reviewComment"
                rows={3}
                className="review-textarea"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Bagaimana kondisi fisik barang, fungsi baterai, dan kecepatan pengiriman?"
                required
              />
            </div>

            {/* Tombol Kirim */}
            <div className="review-form-actions">
              <button
                type="button"
                className="btn-cancel-review"
                onClick={() => setShowReviewForm(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn-submit-review">
                <span className="material-symbols-outlined">send</span>
                <span>Kirim Ulasan</span>
              </button>
            </div>
          </form>
        )}

        {/* DAFTAR ULASAN PEMBELI */}
        <div className="reviews-list-container">
          {reviews.length === 0 ? (
            <div className="reviews-empty-state">
              <span className="material-symbols-outlined">reviews</span>
              <p>Belum ada ulasan untuk gadget ini. Jadilah yang pertama memberikan penilaian!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="review-card-item">
                <div className="review-card-header">
                  <div className="reviewer-info-wrap">
                    <div className="reviewer-avatar-circle">
                      {rev.name ? rev.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="reviewer-name-row">
                        <strong>{rev.name}</strong>
                        {rev.verified && (
                          <span className="verified-buyer-tag" title="Pembeli Terverifikasi">
                            <span className="material-symbols-outlined">verified</span>
                            Terverifikasi
                          </span>
                        )}
                        {rev.isUserReview && (
                          <span className="user-review-tag">Ulasan Anda</span>
                        )}
                      </div>
                      <span className="review-date-text">{rev.date}</span>
                    </div>
                  </div>

                  {/* Bintang Ulasan */}
                  <div className="review-stars-wrap">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`material-symbols-outlined star-icon ${
                          s <= rev.rating ? "filled" : ""
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                {/* Teks Ulasan */}
                <p className="review-comment-body">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================
          MODAL KONFIRMASI HAPUS
          ======================================================== */}
      {showDeleteModal && (
        <div
          className="soft-delete-modal-backdrop"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div className="soft-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            {deleteSuccess ? (
              <div className="modal-success-state">
                <div className="modal-icon-circle success">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h3>Produk Berhasil Dihapus</h3>
                <p>Mengalihkan ke beranda...</p>
              </div>
            ) : (
              <>
                <div className="modal-header-icon-wrap">
                  <div className="modal-icon-circle danger">
                    <span className="material-symbols-outlined">delete</span>
                  </div>
                </div>

                <h3 className="modal-title">Hapus Produk?</h3>

                <p className="modal-desc">
                  Apakah Anda yakin ingin menghapus <strong>"{product.name}"</strong>?
                </p>

                {deleteError && (
                  <div className="modal-error-alert">
                    <span className="material-symbols-outlined">error</span>
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-btn cancel"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="modal-btn delete"
                    onClick={handleConfirmSoftDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="material-symbols-outlined spin-icon">sync</span>
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">delete</span>
                        <span>Hapus</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL ATUR STOK UNIT
          ======================================================== */}
      {showStockModal && (
        <div
          className="soft-delete-modal-backdrop"
          onClick={() => !isUpdatingStock && setShowStockModal(false)}
        >
          <div
            className="soft-delete-modal-card stock-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-icon-wrap">
              <div className="modal-icon-circle stock-circle">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
            </div>

            <h3 className="modal-title">Atur Stok Produk</h3>
            <p className="modal-desc">
              Perbarui ketersediaan unit untuk <strong>{product.name}</strong>.
            </p>

            {/* Stepper Pengatur Stok */}
            <div className="stock-stepper-box">
              <button
                type="button"
                className="stock-step-btn minus"
                onClick={() =>
                  setStockInput((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1))
                }
                title="Kurangi 1 unit"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>

              <div className="stock-input-wrap">
                <input
                  type="number"
                  min="0"
                  className="stock-number-input"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                />
                <span className="stock-unit-label">Unit</span>
              </div>

              <button
                type="button"
                className="stock-step-btn plus"
                onClick={() =>
                  setStockInput((prev) => (parseInt(prev, 10) || 0) + 1)
                }
                title="Tambah 1 unit"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Pilihan Cepat (Preset) */}
            <div className="stock-presets-wrap">
              <span className="presets-label">Pilihan Cepat:</span>
              <div className="presets-pill-row">
                <button
                  type="button"
                  className={`preset-pill ${Number(stockInput) === 0 ? "active" : ""}`}
                  onClick={() => setStockInput(0)}
                >
                  Habis (0)
                </button>
                {[1, 2, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`preset-pill ${Number(stockInput) === num ? "active" : ""}`}
                    onClick={() => setStockInput(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Pratinjau */}
            <div className="stock-status-preview">
              {Number(stockInput) === 0 ? (
                <span className="stock-alert warning">
                  <span className="material-symbols-outlined">warning</span>
                  Produk akan ditandai <strong>Stok Habis</strong> di katalog.
                </span>
              ) : (
                <span className="stock-alert success">
                  <span className="material-symbols-outlined">check_circle</span>
                  Unit siap dijual dengan stok <strong>{stockInput} unit</strong>.
                </span>
              )}
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={() => setShowStockModal(false)}
                disabled={isUpdatingStock}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn confirm stock-confirm"
                onClick={handleSaveStock}
                disabled={isUpdatingStock}
              >
                {isUpdatingStock ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;

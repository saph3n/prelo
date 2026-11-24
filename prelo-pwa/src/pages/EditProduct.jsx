// EditProduct.jsx — Halaman Edit Data Produk
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

// Pilihan kondisi produk
const CONDITIONS = ["Mulus", "Bekas normal", "Ada minus"];

/**
 * Kompresi gambar dari file picker perangkat menjadi Base64 Data URL
 * Menggunakan HTML5 Canvas agar hemat memori & cepat disimpan.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 540;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.68);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State mode unggah foto: "file" atau "url"
  const [uploadMode, setUploadMode] = useState("file");
  const [imagePreview, setImagePreview] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // State form edit produk
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category_id: "",
    condition: CONDITIONS[0],
    price: "",
    stock: 1,
    image_url: "",
    description: "",
  });

  // Fetch data produk & daftar kategori sekaligus
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([api.get(`/products/${id}`), api.get("/categories")])
      .then(([prodRes, catRes]) => {
        const p = prodRes.data;
        setForm({
          name: p.name || "",
          brand: p.brand || "",
          category_id: p.category_id || (p.categories ? p.categories.id : ""),
          condition: p.condition || CONDITIONS[0],
          price: p.price ?? "",
          stock: p.stock ?? 1,
          image_url: p.image_url || "",
          description: p.description || "",
        });
        setImagePreview(p.image_url || "");
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Gagal memuat data produk untuk diedit."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Handler perubahan input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler pemilihan file gambar baru dari perangkat
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Silakan pilih file gambar yang valid (JPG, PNG, atau WEBP)");
      return;
    }

    setIsProcessingImage(true);
    setError(null);
    try {
      const base64Data = await compressImage(file);
      setForm((prev) => ({ ...prev, image_url: base64Data }));
      setImagePreview(base64Data);
    } catch {
      setError("Gagal memproses gambar dari penyimpanan perangkat.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handler menghapus foto produk
  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImagePreview("");
  };

  // Submit update produk ke backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put(`/products/${id}`, {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category_id: form.category_id || null,
        condition: form.condition,
        price: Number(form.price),
        stock: Number(form.stock) || 1,
        image_url: form.image_url || null,
        description: form.description?.trim() || null,
      });

      // Berhasil update → kembali ke halaman detail produk
      navigate(`/product/${id}`, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal memperbarui produk. Pastikan semua field terisi dengan benar.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p className="state-msg loading-pulse">
          <span className="material-symbols-outlined">hourglass_top</span>
          Memuat data produk...
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-wrapper">
        {/* Navigasi atas */}
        <div className="detail-top-nav mb-md">
          <button
            type="button"
            className="btn btn-outline back-btn"
            onClick={() => navigate(`/product/${id}`)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Batal & Kembali</span>
          </button>
        </div>

        <div className="page-header">
          <div>
            <h1>Edit Informasi Produk</h1>
            <p className="page-subheader">
              Perbarui harga, stok, kondisi, atau deskripsi gadget Anda
            </p>
          </div>
          <span className="material-symbols-outlined page-header-icon">edit_note</span>
        </div>

        {/* Notifikasi error jika ada */}
        {error && (
          <div className="error-box">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          {/* Nama produk */}
          <div className="form-group">
            <label>Nama Produk *</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Contoh: iPhone 14 Pro Max 256GB Deep Purple"
            />
          </div>

          {/* Baris: Merek & Kategori */}
          <div className="form-row">
            <div className="form-group">
              <label>Merek *</label>
              <input
                className="form-control"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="Contoh: Apple, Samsung, Asus"
              />
            </div>

            <div className="form-group">
              <label>Kategori *</label>
              <select
                className="form-control"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih kategori produk</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris: Kondisi, Harga & Stok */}
          <div className="form-row">
            <div className="form-group">
              <label>Kondisi Unit *</label>
              <select
                className="form-control"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Harga Jual (Rp) *</label>
              <input
                className="form-control"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="Contoh: 8500000"
              />
            </div>

            <div className="form-group">
              <label>Stok Tersedia *</label>
              <input
                className="form-control"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                placeholder="1"
              />
            </div>
          </div>

          {/* Bagian Ubah Foto Produk */}
          <div className="form-group">
            <div className="upload-header">
              <label>Foto Produk</label>
              <div className="upload-mode-toggle">
                <button
                  type="button"
                  className={`toggle-tab-btn ${uploadMode === "file" ? "active" : ""}`}
                  onClick={() => setUploadMode("file")}
                >
                  <span className="material-symbols-outlined">folder_open</span>
                  Galeri & Berkas
                </button>
                <button
                  type="button"
                  className={`toggle-tab-btn ${uploadMode === "url" ? "active" : ""}`}
                  onClick={() => setUploadMode("url")}
                >
                  <span className="material-symbols-outlined">link</span>
                  Tautan Gambar
                </button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div className="file-upload-box">
                {imagePreview ? (
                  <div className="image-preview-card">
                    <img
                      src={imagePreview}
                      alt="Preview Produk"
                      className="preview-thumbnail"
                    />
                    <div className="preview-info">
                      <span className="preview-status">
                        <span className="material-symbols-outlined">check_circle</span>
                        Foto produk saat ini
                      </span>
                      <div className="preview-actions">
                        <label className="btn btn-outline preview-btn">
                          <span className="material-symbols-outlined">photo_camera</span>
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btn-fav preview-btn"
                          onClick={handleRemoveImage}
                        >
                          <span className="material-symbols-outlined">delete</span>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="dropzone-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      disabled={isProcessingImage}
                    />
                    <div className="dropzone-content">
                      <div className="dropzone-icon-wrap">
                        <span className="material-symbols-outlined">
                          {isProcessingImage ? "sync" : "add_photo_alternate"}
                        </span>
                      </div>
                      <div className="dropzone-text">
                        <strong>
                          {isProcessingImage ? "Mengompresi Gambar..." : "Pilih Foto dari Galeri"}
                        </strong>
                        <span>JPG, PNG, atau WEBP (otomatis dioptimalkan)</span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div className="url-upload-box">
                <div className="url-input-wrap">
                  <span className="material-symbols-outlined url-icon">link</span>
                  <input
                    className="form-control url-input"
                    name="image_url"
                    value={form.image_url}
                    onChange={(e) => {
                      handleChange(e);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://contoh.com/gambar-gadget.jpg"
                  />
                </div>
                {form.image_url && (
                  <div className="url-preview-wrapper">
                    <img
                      src={form.image_url}
                      alt="Preview URL"
                      className="url-preview-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi & Minus */}
          <div className="form-group">
            <label>Deskripsi & Kondisi Fisik</label>
            <textarea
              className="form-control"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Jelaskan riwayat pemakaian, kelengkapan (box/charger), persentase battery health, dan kondisi fisik secara jujur..."
            />
          </div>

          {/* Tombol Aksi */}
          <div className="edit-form-actions-row">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(`/product/${id}`)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isProcessingImage}
            >
              <span className="material-symbols-outlined">
                {submitting ? "sync" : "save"}
              </span>
              <span>{submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;

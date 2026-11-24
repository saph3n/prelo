// Sell.jsx — Halaman Jual: form penambahan produk dengan opsi upload dari storage perangkat
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Pilihan kondisi produk
const CONDITIONS = ["Mulus", "Bekas normal", "Ada minus"];

/**
 * Kompresi gambar dari file picker perangkat menjadi Base64 Data URL
 * Menggunakan HTML5 Canvas agar ukuran file hemat (~25-45KB) dan cepat diunggah.
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

        // Kompresi ke format JPEG kualitas 0.68
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

function Sell() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State mode unggah foto: "file" (dari storage) atau "url" (link web)
  const [uploadMode, setUploadMode] = useState("file");
  const [imagePreview, setImagePreview] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // State form produk
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

  // Fetch kategori untuk dropdown
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Update field teks form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler pemilihan file dari penyimpanan perangkat / galeri
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

  // Hapus foto yang sudah dipilih
  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImagePreview("");
  };

  // Submit form ke API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/products", {
        name: form.name,
        brand: form.brand,
        category_id: form.category_id || null, // UUID kategori dari Supabase
        condition: form.condition,
        price: Number(form.price),
        stock: Number(form.stock) >= 0 ? Number(form.stock) : 1,
        image_url: form.image_url || null,
        description: form.description?.trim() || null,
      });

      // Berhasil → pindah ke Beranda
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menambahkan produk. Pastikan semua data sudah terisi dengan benar.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="form-wrapper">
        <div className="page-header">
          <div>
            <h1>Jual Gadget Kamu</h1>
            <p className="page-subheader">Isi data produk dengan lengkap untuk mulai menjual</p>
          </div>
          <span className="material-symbols-outlined page-header-icon">sell</span>
        </div>

        {/* Pesan error dari API / validasi */}
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

          {/* Baris responsif: Merek & Kategori */}
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

          {/* Baris responsif: Kondisi, Harga, & Jumlah Stok */}
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
              <label>Jumlah Stok *</label>
              <input
                className="form-control"
                name="stock"
                type="number"
                min="1"
                value={form.stock}
                onChange={handleChange}
                required
                placeholder="1"
              />
            </div>
          </div>

          {/* Bagian Unggah Foto Produk (Storage Perangkat vs URL) */}
          <div className="form-group">
            <div className="upload-header">
              <label>Foto Produk (opsional)</label>
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
                    <img src={imagePreview} alt="Preview Produk" className="preview-thumbnail" />
                    <div className="preview-info">
                      <span className="preview-status">
                        <span className="material-symbols-outlined">check_circle</span>
                        Foto berhasil dipilih
                      </span>
                      <div className="preview-actions">
                        <label className="btn btn-outline preview-btn">
                          <span className="material-symbols-outlined">photo_camera</span>
                          Ganti
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
                    />
                    <div className="dropzone-content">
                      <div className="dropzone-icon">
                        <span className="material-symbols-outlined">
                          {isProcessingImage ? "hourglass_top" : "add_photo_alternate"}
                        </span>
                      </div>
                      <p className="dropzone-title">
                        {isProcessingImage ? "Mengompres foto..." : "Pilih foto dari penyimpanan perangkat"}
                      </p>
                      <span className="dropzone-hint">
                        Buka galeri atau file explorer (JPG, PNG, WEBP)
                      </span>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div>
                <input
                  className="form-control"
                  name="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => {
                    handleChange(e);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... atau link foto online"
                />
                {form.image_url && (
                  <div className="url-preview-wrapper mt-sm">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="url-preview-img"
                      onError={() => setError("URL gambar tidak valid atau tidak dapat dimuat")}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi (opsional) */}
          <div className="form-group">
            <label>Deskripsi & Kelengkapan (opsional)</label>
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Jelaskan kondisi fisik, battery health, fungsi kamera, kelengkapan kotak & charger (opsional)..."
            />
          </div>

          {/* Tombol submit */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting || isProcessingImage}
          >
            <span className="material-symbols-outlined">publish</span>
            {submitting ? "Memproses Data..." : "Pasang Iklan Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sell;

// ProductCard.jsx — kartu produk premium bergaya modern NovaTech
import { Link } from "react-router-dom";
import { rupiah, PLACEHOLDER_IMG } from "../services/utils";

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card nova-card">
      {/* Gambar produk bersih tanpa badge di pojok gambar */}
      <div className="card-img-wrapper">
        <img
          src={product.image_url || PLACEHOLDER_IMG}
          alt={product.name}
          loading="lazy"
        />
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
  );
}

export default ProductCard;
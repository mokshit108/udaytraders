import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTag,
  faDollarSign,
  faBoxes,
  faBuilding,
  faLayerGroup,
  faStar,
  faAlignLeft,
  faCheckCircle,
  faExclamationCircle,
  faPencilAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import ProductImageField from "../../../../components/admin/ProductImageField";
import useImageUpload from "../../../../hooks/useImageUpload";

const parseImageUrls = (value) => {
  try {
    if (typeof value === "string" && value.trim().startsWith("[")) {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    }
    return value ? [value] : [];
  } catch {
    return value ? [value] : [];
  }
};

const EditProductModal = ({ isOpen, onClose, onProductUpdated, product, categories, companies }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCompany, setProductCompany] = useState("");
  const [productSeries, setProductSeries] = useState("");
  const [productIsPopular, setProductIsPopular] = useState(false);

  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [mainImageKey, setMainImageKey] = useState(null);

  const images = useImageUpload();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const tableName = "Product";

  useEffect(() => {
    if (product && isOpen) {
      setProductName(product.name || "");
      setProductDescription(product.description || "");
      setProductPrice(product.price?.toString() || "");
      setProductStock(product.stock?.toString() || "");
      setProductCategory(product.category_name || "");

      const parsedImages = parseImageUrls(product.img_url);
      setExistingImageUrls(parsedImages);
      setMainImageKey(parsedImages[0] || null);

      setProductCompany(product.company_name || "");
      setProductIsPopular(product.is_popular === 1);
      setProductSeries(product.series || "");
      setSuccess(false);
      setError("");
      images.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isOpen]);

  const handleRemoveExisting = (index) => {
    const removedUrl = existingImageUrls[index];
    setExistingImageUrls((previous) => previous.filter((_, i) => i !== index));
    if (removedUrl === mainImageKey) setMainImageKey(null);
  };

  const handleRemoveNewImage = (id) => {
    const removed = images.items.find((item) => item.id === id);
    images.removeItem(id);
    if (removed && removed.previewUrl === mainImageKey) setMainImageKey(null);
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductStock("");
    setProductCategory("");
    setExistingImageUrls([]);
    setProductCompany("");
    setProductIsPopular(false);
    setProductSeries("");
    setMainImageKey(null);
    images.clear();
    setError("");
    setSuccess(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!productName || !productPrice || !productCategory || !productCompany) {
      setError("Name, Price, Category, and Company are required.");
      return;
    }
    if (isNaN(productPrice) || Number(productPrice) <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (productStock !== "" && (isNaN(productStock) || Number(productStock) < 0)) {
      setError("Stock must be a non-negative number.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1️⃣ Upload the newly added images before touching the record
      let newImages = [];
      if (images.items.length > 0) {
        const { uploads, failures } = await images.uploadAll();
        if (failures.length > 0) {
          const detail =
            failures.length === 1
              ? `"${failures[0].name}" could not be uploaded: ${failures[0].error}`
              : `${failures.length} images could not be uploaded. Retry or remove them before saving.`;
          setError(detail);
          return;
        }
        newImages = uploads;
      }

      // 2️⃣ Saved images first, then the ones just uploaded, main image first
      const combined = [
        ...existingImageUrls.map((url) => ({ key: url, url })),
        ...newImages.map((entry) => ({ key: entry.previewUrl, url: entry.url })),
      ];
      const mainIndex = mainImageKey
        ? combined.findIndex((entry) => entry.key === mainImageKey)
        : -1;
      if (mainIndex > 0) combined.unshift(...combined.splice(mainIndex, 1));

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/crud/${tableName}/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          price: parseFloat(productPrice),
          stock: productStock !== "" ? parseInt(productStock) : 0,
          category_name: productCategory,
          img_url: JSON.stringify(combined.map((entry) => entry.url)),
          company_name: productCompany,
          is_popular: productIsPopular ? 1 : 0,
          series: productSeries,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            errData.message ||
            `Error: ${response.statusText || response.status}`
        );
      }

      setSuccess(true);
      setTimeout(() => { onProductUpdated(); handleClose(); }, 1400);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="apm-overlay"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="apm-modal">

        {/* Header */}
        <div className="apm-header">
          <div className="apm-header-icon">
            <FontAwesomeIcon icon={faPencilAlt} />
          </div>
          <div>
            <h2 className="apm-title">Edit Product</h2>
            <p className="apm-subtitle">Update the product details below</p>
          </div>
          <button className="apm-close-btn" onClick={handleClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="apm-alert apm-alert--error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="apm-alert apm-alert--success">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Product updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apm-form">

          {/* Images */}
          <ProductImageField
            items={images.items}
            rejections={images.rejections}
            existingUrls={existingImageUrls}
            mainImageKey={mainImageKey}
            onMainImageChange={setMainImageKey}
            onAddFiles={images.addFiles}
            onRemoveItem={handleRemoveNewImage}
            onRetryItem={images.retryItem}
            onRemoveExisting={handleRemoveExisting}
            onRemoveRejection={images.removeRejection}
            disabled={isSubmitting || success}
          />

          {/* Two-column grid */}
          <div className="apm-grid">

            <div className="apm-field apm-field--full">
              <label className="apm-label" htmlFor="apm-edit-name">
                <FontAwesomeIcon icon={faTag} /> Product Name <span className="apm-req">*</span>
              </label>
              <input
                type="text"
                id="apm-edit-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="apm-input"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="apm-field apm-field--full">
              <label className="apm-label" htmlFor="apm-edit-desc">
                <FontAwesomeIcon icon={faAlignLeft} /> Description
              </label>
              <textarea
                id="apm-edit-desc"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="apm-input apm-textarea"
                placeholder="Enter product description (optional)"
                rows={2}
              />
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-edit-price">
                <FontAwesomeIcon icon={faDollarSign} /> Price (₹) <span className="apm-req">*</span>
              </label>
              <input
                type="number"
                id="apm-edit-price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="apm-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-edit-stock">
                <FontAwesomeIcon icon={faBoxes} /> Stock Quantity
              </label>
              <input
                type="number"
                id="apm-edit-stock"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="apm-input"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-edit-category">
                <FontAwesomeIcon icon={faLayerGroup} /> Category <span className="apm-req">*</span>
              </label>
              <select
                id="apm-edit-category"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="apm-input apm-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-edit-company">
                <FontAwesomeIcon icon={faBuilding} /> Company <span className="apm-req">*</span>
              </label>
              <select
                id="apm-edit-company"
                value={productCompany}
                onChange={(e) => setProductCompany(e.target.value)}
                className="apm-input apm-select"
                required
              >
                <option value="">Select a company</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.name}>{comp.name}</option>
                ))}
              </select>
            </div>

            <div className="apm-field apm-field--full">
              <label className="apm-label" htmlFor="apm-edit-series">
                <FontAwesomeIcon icon={faLayerGroup} /> Series
              </label>
              <input
                type="text"
                id="apm-edit-series"
                value={productSeries}
                onChange={(e) => setProductSeries(e.target.value)}
                className="apm-input"
                placeholder="e.g. Gold, Normal, Prime (optional)"
              />
            </div>

            <div className="apm-field apm-field--full">
              <div className="apm-toggle-row">
                <div className="apm-toggle-info">
                  <FontAwesomeIcon icon={faStar} className="apm-star" />
                  <div>
                    <p className="apm-toggle-label">Mark as Popular</p>
                    <p className="apm-toggle-desc">Show this product in the popular section</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProductIsPopular(!productIsPopular)}
                  className={`apm-toggle ${productIsPopular ? "apm-toggle--on" : ""}`}
                  aria-pressed={productIsPopular}
                >
                  <span className="apm-toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="apm-footer">
            <button type="button" onClick={handleClose} className="apm-btn apm-btn--cancel">
              Cancel
            </button>
            <button
              type="submit"
              className="apm-btn apm-btn--submit"
              disabled={isSubmitting || images.isUploading || success}
            >
              {images.isUploading ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Uploading image…</>
              ) : isSubmitting ? (
                <><span className="apm-spinner" /> Saving…</>
              ) : success ? (
                <><FontAwesomeIcon icon={faCheckCircle} /> Updated!</>
              ) : (
                <><FontAwesomeIcon icon={faPencilAlt} /> Update Product</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Scoped styles */}
      <style>{`
        .apm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .apm-modal {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 620px; max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 30px 70px rgba(0,0,0,0.22);
          animation: apmSlide 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes apmSlide {
          from { opacity:0; transform: translateY(28px) scale(0.96); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }

        /* Header */
        .apm-header {
          display: flex; align-items: center; gap: 14px;
          padding: 22px 26px 18px; border-bottom: 1px solid #f0f0f0;
          position: relative;
        }
        .apm-header-icon {
          width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg,#0c4a6e,#0284c7);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 15px;
        }
        .apm-title  { font-size:17px; font-weight:700; color:#0c2340; margin:0; }
        .apm-subtitle { font-size:12px; color:#94a3b8; margin:2px 0 0; }
        .apm-close-btn {
          position:absolute; top:18px; right:18px;
          background:#f1f5f9; border:none; border-radius:8px;
          width:32px; height:32px; display:flex; align-items:center;
          justify-content:center; color:#64748b; cursor:pointer; transition:.2s;
        }
        .apm-close-btn:hover { background:#e2e8f0; color:#1e293b; }

        /* Alerts */
        .apm-alert {
          display:flex; align-items:center; gap:9px;
          padding:11px 20px; font-size:13px; font-weight:500;
          margin:14px 26px 0; border-radius:10px;
        }
        .apm-alert span { white-space: pre-line; }
        .apm-alert--error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .apm-alert--success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }

        /* Form */
        .apm-form { padding: 20px 26px 26px; }

        /* Grid */
        .apm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .apm-field { display:flex; flex-direction:column; gap:5px; }
        .apm-field--full { grid-column: 1 / -1; }

        .apm-label {
          font-size:12.5px; font-weight:600; color:#475569;
          display:flex; align-items:center; gap:6px;
        }
        .apm-req { color:#ef4444; }

        .apm-input {
          padding:10px 13px; border:1.5px solid #e2e8f0; border-radius:10px;
          font-size:14px; color:#1e293b; background:#fff; outline:none;
          width:100%; box-sizing:border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .apm-input:focus {
          border-color:#0284c7;
          box-shadow: 0 0 0 3px rgba(2,132,199,0.12);
        }
        .apm-input::placeholder { color:#94a3b8; }
        .apm-textarea { resize:vertical; min-height:60px; font-family:inherit; }
        .apm-select {
          appearance:none; cursor:pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position: right 12px center;
          padding-right:36px;
        }

        /* Toggle */
        .apm-toggle-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:13px 15px; background:#f8fafc;
          border-radius:12px; border:1.5px solid #e2e8f0;
        }
        .apm-toggle-info  { display:flex; align-items:center; gap:12px; }
        .apm-star         { color:#f59e0b; font-size:18px; }
        .apm-toggle-label { font-size:13.5px; font-weight:600; color:#1e293b; margin:0; }
        .apm-toggle-desc  { font-size:11.5px; color:#94a3b8; margin:2px 0 0; }

        .apm-toggle {
          position:relative; width:48px; height:26px;
          border-radius:999px; background:#e2e8f0;
          border:none; cursor:pointer; transition:background .25s; flex-shrink:0;
        }
        .apm-toggle--on { background: linear-gradient(135deg,#0c4a6e,#0284c7); }
        .apm-toggle-knob {
          position:absolute; top:3px; left:3px;
          width:20px; height:20px; border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
          transition: transform .25s cubic-bezier(0.34,1.56,0.64,1); display:block;
        }
        .apm-toggle--on .apm-toggle-knob { transform: translateX(22px); }

        /* Footer */
        .apm-footer {
          display:flex; justify-content:flex-end; gap:11px;
          margin-top:22px; padding-top:18px; border-top:1px solid #f0f0f0;
        }
        .apm-btn {
          padding:10px 22px; border-radius:10px; font-size:14px;
          font-weight:600; cursor:pointer; border:none;
          display:flex; align-items:center; gap:7px; transition:.2s;
        }
        .apm-btn--cancel { background:#f1f5f9; color:#64748b; }
        .apm-btn--cancel:hover { background:#e2e8f0; color:#1e293b; }
        .apm-btn--submit {
          background: linear-gradient(135deg,#0c4a6e,#0284c7);
          color:#fff; min-width:140px; justify-content:center;
        }
        .apm-btn--submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2,132,199,0.35);
        }
        .apm-btn--submit:disabled { opacity:.7; cursor:not-allowed; }

        .apm-spinner {
          width:15px; height:15px;
          border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
          border-radius:50%; animation: apmSpin .7s linear infinite; display:inline-block;
        }
        @keyframes apmSpin { to { transform:rotate(360deg); } }

        @media (max-width: 480px) {
          .apm-grid { grid-template-columns: 1fr; }
          .apm-field--full { grid-column: 1; }
          .apm-header, .apm-form { padding-left:16px; padding-right:16px; }
          .apm-footer { flex-direction: column-reverse; gap:10px; padding: 0 16px 20px; }
          .apm-btn { width:100%; justify-content:center; padding:12px 22px; }
          .apm-alert { margin-left:16px; margin-right:16px; }
        }
      `}</style>
    </div>
  );
};

export default EditProductModal;

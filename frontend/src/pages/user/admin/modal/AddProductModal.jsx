import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faImage,
  faTag,
  faDollarSign,
  faBoxes,
  faBuilding,
  faLayerGroup,
  faStar,
  faAlignLeft,
  faCheckCircle,
  faExclamationCircle,
  faPlus,
  faCloudUploadAlt,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const AddProductModal = ({ isOpen, onClose, onProductAdded, categories, companies }) => {
  const [productName, setProductName]           = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice]         = useState("");
  const [productStock, setProductStock]         = useState("");
  const [productCategory, setProductCategory]   = useState("");
  const [productImageUrl, setProductImageUrl]   = useState(""); // final Cloudinary URL
  const [productCompany, setProductCompany]     = useState("");
  const [productIsPopular, setProductIsPopular] = useState(false);

  const [imageFile, setImageFile]         = useState(null);   // selected File object
  const [imagePreview, setImagePreview]   = useState("");     // local blob URL for preview
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);    // 0-100 fake progress
  const [dragOver, setDragOver]           = useState(false);

  const [error, setError]         = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);

  const fileInputRef = useRef(null);
  const tableName    = "Product";

  /* ──────────────────────────────────────────────
     Image helpers
  ────────────────────────────────────────────── */
  const processFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setProductImageUrl(""); // clear any old URL
  };

  const handleFileInput = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setProductImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* Upload selected file to Cloudinary via backend */
  const uploadToCloudinary = async () => {
    if (!imageFile) return null;
    setUploadingImage(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("image", imageFile);

    // Fake progress ticks while request is in-flight
    const ticker = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 10 : p));
    }, 300);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/upload/image`, {
        method: "POST",
        body: formData,
      });
      clearInterval(ticker);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Image upload failed.");
      }
      const data = await res.json();
      setUploadProgress(100);
      return data.url; // Cloudinary secure_url
    } catch (err) {
      clearInterval(ticker);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  /* ──────────────────────────────────────────────
     Form helpers
  ────────────────────────────────────────────── */
  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductStock("");
    setProductCategory("");
    setProductImageUrl("");
    setProductCompany("");
    setProductIsPopular(false);
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      // 1️⃣ Upload image first if a file was selected
      let finalUrl = productImageUrl;
      if (imageFile) {
        finalUrl = await uploadToCloudinary();
        setProductImageUrl(finalUrl);
      }

      // 2️⃣ Save product to DB
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/crud/new/${tableName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          productName,
          description:   productDescription,
          price:         parseFloat(productPrice),
          stock:         productStock !== "" ? parseInt(productStock) : 0,
          category_name: productCategory,
          img_url:       finalUrl,
          company_name:  productCompany,
          is_popular:    productIsPopular ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error: ${response.statusText}`);
      }

      setSuccess(true);
      setTimeout(() => { onProductAdded(); handleClose(); }, 1400);
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* ──────────────────────────────────────────────
     Render
  ────────────────────────────────────────────── */
  return (
    <div
      className="apm-overlay"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="apm-modal">

        {/* ── Header ── */}
        <div className="apm-header">
          <div className="apm-header-icon">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div>
            <h2 className="apm-title">Add New Product</h2>
            <p className="apm-subtitle">Fill in the details below to add a product</p>
          </div>
          <button className="apm-close-btn" onClick={handleClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="apm-alert apm-alert--error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="apm-alert apm-alert--success">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Product added successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apm-form">

          {/* ── Image Upload Zone ── */}
          <div className="apm-image-section">
            <p className="apm-section-label">
              <FontAwesomeIcon icon={faImage} /> Product Image
            </p>

            {/* Preview (shown after file chosen) */}
            {imagePreview ? (
              <div className="apm-image-preview-wrap">
                <img src={imagePreview} alt="Preview" className="apm-preview-img" />

                {/* Upload progress bar */}
                {uploadingImage && (
                  <div className="apm-progress-bar-wrap">
                    <div className="apm-progress-bar" style={{ width: `${uploadProgress}%` }} />
                    <span className="apm-progress-label">
                      <FontAwesomeIcon icon={faSpinner} spin /> Uploading to Cloudinary…
                    </span>
                  </div>
                )}

                {/* Uploaded badge */}
                {productImageUrl && !uploadingImage && (
                  <div className="apm-uploaded-badge">
                    <FontAwesomeIcon icon={faCheckCircle} /> Uploaded to Cloudinary
                  </div>
                )}

                <button
                  type="button"
                  className="apm-remove-img-btn"
                  onClick={removeImage}
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ) : (
              /* Drag-and-drop zone */
              <div
                className={`apm-dropzone ${dragOver ? "apm-dropzone--active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="apm-dropzone-icon">
                  <FontAwesomeIcon icon={faCloudUploadAlt} />
                </div>
                <p className="apm-dropzone-text">
                  <strong>Click to upload</strong> or drag &amp; drop
                </p>
                <p className="apm-dropzone-hint">JPEG, PNG, WEBP, GIF · Max 5 MB</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
          </div>

          {/* ── Two-column grid ── */}
          <div className="apm-grid">

            {/* Product Name */}
            <div className="apm-field apm-field--full">
              <label className="apm-label" htmlFor="apm-name">
                <FontAwesomeIcon icon={faTag} /> Product Name <span className="apm-req">*</span>
              </label>
              <input
                type="text"
                id="apm-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="apm-input"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div className="apm-field apm-field--full">
              <label className="apm-label" htmlFor="apm-desc">
                <FontAwesomeIcon icon={faAlignLeft} /> Description
              </label>
              <textarea
                id="apm-desc"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="apm-input apm-textarea"
                placeholder="Enter product description (optional)"
                rows={2}
              />
            </div>

            {/* Price */}
            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-price">
                <FontAwesomeIcon icon={faDollarSign} /> Price (₹) <span className="apm-req">*</span>
              </label>
              <input
                type="number"
                id="apm-price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="apm-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Stock */}
            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-stock">
                <FontAwesomeIcon icon={faBoxes} /> Stock Quantity
              </label>
              <input
                type="number"
                id="apm-stock"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="apm-input"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            {/* Category */}
            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-category">
                <FontAwesomeIcon icon={faLayerGroup} /> Category <span className="apm-req">*</span>
              </label>
              <select
                id="apm-category"
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

            {/* Company */}
            <div className="apm-field">
              <label className="apm-label" htmlFor="apm-company">
                <FontAwesomeIcon icon={faBuilding} /> Company <span className="apm-req">*</span>
              </label>
              <select
                id="apm-company"
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

            {/* Is Popular toggle */}
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

          {/* ── Footer ── */}
          <div className="apm-footer">
            <button type="button" onClick={handleClose} className="apm-btn apm-btn--cancel">
              Cancel
            </button>
            <button
              type="submit"
              className="apm-btn apm-btn--submit"
              disabled={isSubmitting || uploadingImage || success}
            >
              {uploadingImage ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Uploading…</>
              ) : isSubmitting ? (
                <><span className="apm-spinner" /> Saving…</>
              ) : success ? (
                <><FontAwesomeIcon icon={faCheckCircle} /> Added!</>
              ) : (
                <><FontAwesomeIcon icon={faPlus} /> Add Product</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Scoped styles ── */}
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
        .apm-alert--error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .apm-alert--success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }

        /* Form */
        .apm-form { padding: 20px 26px 26px; }
        .apm-section-label {
          font-size:12.5px; font-weight:600; color:#475569;
          display:flex; align-items:center; gap:6px; margin-bottom:10px;
        }

        /* Image section */
        .apm-image-section { margin-bottom: 20px; }

        /* Drop zone */
        .apm-dropzone {
          border: 2px dashed #cbd5e1; border-radius: 14px;
          padding: 32px 20px; text-align: center;
          cursor: pointer; transition: all .2s;
          background: #f8fafc;
        }
        .apm-dropzone:hover, .apm-dropzone--active {
          border-color: #0284c7; background: #eff8ff;
        }
        .apm-dropzone-icon {
          font-size: 36px; color: #94a3b8; margin-bottom: 10px;
          transition: .2s;
        }
        .apm-dropzone:hover .apm-dropzone-icon,
        .apm-dropzone--active .apm-dropzone-icon { color: #0284c7; }
        .apm-dropzone-text  { font-size:14px; color:#475569; margin:0 0 4px; }
        .apm-dropzone-hint  { font-size:11.5px; color:#94a3b8; margin:0; }

        /* Preview */
        .apm-image-preview-wrap {
          position: relative; border-radius: 14px; overflow: hidden;
          border: 2px solid #e2e8f0; background: #f8fafc;
        }
        .apm-preview-img {
          width: 100%; max-height: 200px; object-fit: cover; display: block;
        }
        .apm-remove-img-btn {
          position: absolute; top: 10px; right: 10px;
          background: rgba(220,38,38,0.9); color: #fff;
          border: none; border-radius: 8px; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 13px; transition: .2s;
        }
        .apm-remove-img-btn:hover { background: #dc2626; transform: scale(1.08); }

        /* Progress bar */
        .apm-progress-bar-wrap {
          padding: 10px 14px;
          background: rgba(0,0,0,0.55);
          position: absolute; bottom: 0; left: 0; right: 0;
        }
        .apm-progress-bar {
          height: 4px; background: #38bdf8; border-radius: 999px;
          transition: width .3s ease;
        }
        .apm-progress-label {
          font-size: 11px; color: #fff; margin-top: 4px;
          display: flex; align-items: center; gap: 6px;
        }

        /* Uploaded badge */
        .apm-uploaded-badge {
          position: absolute; bottom: 10px; left: 10px;
          background: rgba(22,163,74,0.9); color: #fff;
          font-size: 11.5px; font-weight: 600;
          padding: 4px 10px; border-radius: 20px;
          display: flex; align-items: center; gap: 5px;
        }

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
        }
      `}</style>
    </div>
  );
};

export default AddProductModal;

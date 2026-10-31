import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faCloudUploadAlt,
  faTrash,
  faStar,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faRotateRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  ACCEPT_ATTR,
  MAX_UPLOAD_LABEL,
  formatBytes,
} from "../../hooks/useImageUpload";

const ProductImageField = ({
  label = "Product Image",
  items = [],
  rejections = [],
  existingUrls = [],
  mainImageKey = null,
  onMainImageChange,
  onAddFiles,
  onRemoveItem,
  onRetryItem,
  onRemoveExisting,
  onRemoveRejection,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const totalImages = existingUrls.length + items.length;
  const mainKey = mainImageKey ?? existingUrls[0] ?? items[0]?.previewUrl ?? null;

  const openPicker = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    onAddFiles(event.dataTransfer?.files);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const renderStar = (key, isMain) => (
    <button
      type="button"
      className="pif-star-btn"
      data-active={isMain ? "true" : "false"}
      onClick={() => onMainImageChange?.(key)}
      aria-label={isMain ? "Main image" : "Set as main image"}
      title={isMain ? "This is the main image" : "Set as main image"}
    >
      <FontAwesomeIcon icon={faStar} />
    </button>
  );

  return (
    <div className="pif-root">
      <div className="pif-label-row">
        <p className="pif-label">
          <FontAwesomeIcon icon={faImage} /> {label}
        </p>
        {totalImages > 0 && (
          <span className="pif-count">
            {totalImages} image{totalImages > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {totalImages > 0 && (
        <div className="pif-grid">
          {existingUrls.map((url, index) => (
            <div className="pif-thumb" key={`existing-${url}-${index}`}>
              <img src={url} alt="Saved product image" className="pif-thumb-img" />
              <span className="pif-chip pif-chip--saved">Saved</span>
              {renderStar(url, url === mainKey)}
              {onRemoveExisting && (
                <button
                  type="button"
                  className="pif-remove-btn"
                  onClick={() => onRemoveExisting(index)}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          ))}

          {items.map((item) => (
            <div
              className="pif-thumb"
              key={item.id}
              data-status={item.status}
              title={item.error || item.name}
            >
              <img src={item.previewUrl} alt={item.name} className="pif-thumb-img" />

              {item.status === "uploading" && (
                <div className="pif-overlay">
                  <FontAwesomeIcon icon={faSpinner} spin className="pif-overlay-icon" />
                  <span className="pif-overlay-text">{item.progress || 0}%</span>
                  <span className="pif-progress-track">
                    <span
                      className="pif-progress-fill"
                      style={{ width: `${Math.max(6, item.progress || 0)}%` }}
                    />
                  </span>
                </div>
              )}

              {item.status === "done" && (
                <span className="pif-chip pif-chip--done">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {formatBytes(item.uploadedBytes || item.size)}
                </span>
              )}

              {item.status === "error" && (
                <div className="pif-overlay pif-overlay--error">
                  <FontAwesomeIcon icon={faExclamationCircle} className="pif-overlay-icon" />
                  <button
                    type="button"
                    className="pif-retry-btn"
                    onClick={() => onRetryItem?.(item.id)}
                  >
                    <FontAwesomeIcon icon={faRotateRight} /> Retry
                  </button>
                </div>
              )}

              {renderStar(item.previewUrl, item.previewUrl === mainKey)}

              <button
                type="button"
                className="pif-remove-btn"
                onClick={() => onRemoveItem?.(item.id)}
                aria-label="Remove image"
                title="Remove image"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      )}

      {rejections.length > 0 && (
        <ul className="pif-rejections">
          {rejections.map((rejection) => (
            <li key={rejection.id}>
              <FontAwesomeIcon icon={faExclamationCircle} className="pif-rejection-icon" />
              <span className="pif-rejection-text">
                <strong>{rejection.name}</strong> — {rejection.reason}
              </span>
              {onRemoveRejection && (
                <button
                  type="button"
                  className="pif-rejection-close"
                  onClick={() => onRemoveRejection(rejection.id)}
                  aria-label="Dismiss"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div
        className={`pif-dropzone ${dragOver ? "pif-dropzone--active" : ""}`}
        data-disabled={disabled ? "true" : "false"}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Add product images"
        aria-disabled={disabled}
      >
        <span className="pif-dropzone-icon">
          <FontAwesomeIcon icon={faCloudUploadAlt} />
        </span>
        <span className="pif-dropzone-text">
          <strong>Click to upload</strong> or drag &amp; drop
        </span>
        <span className="pif-dropzone-hint">
          JPG, PNG, WEBP or GIF · large photos are resized for you · limit{" "}
          {MAX_UPLOAD_LABEL} each
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="pif-file-input"
        onChange={(event) => {
          onAddFiles(event.target.files);
          event.target.value = "";
        }}
        tabIndex={-1}
      />

      <style>{`
        .pif-root { margin-bottom: 20px; }

        .pif-label-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; margin-bottom: 10px;
        }
        .pif-label {
          font-size: 12.5px; font-weight: 600; color: #475569;
          display: flex; align-items: center; gap: 6px; margin: 0;
        }
        .pif-count {
          font-size: 11px; font-weight: 600; color: #0284c7;
          background: #eff8ff; border: 1px solid #bae6fd;
          padding: 2px 8px; border-radius: 999px;
        }

        .pif-grid {
          display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
        }
        .pif-thumb {
          position: relative; width: 96px; height: 96px;
          border-radius: 12px; overflow: hidden;
          border: 2px solid #e2e8f0; background: #f8fafc;
          flex-shrink: 0;
        }
        .pif-thumb[data-status="error"] { border-color: #fca5a5; }
        .pif-thumb[data-status="done"] { border-color: #bbf7d0; }
        .pif-thumb-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .pif-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px;
          background: rgba(12, 74, 110, 0.62); color: #fff;
        }
        .pif-overlay--error { background: rgba(185, 28, 28, 0.78); gap: 6px; }
        .pif-overlay-icon { font-size: 15px; }
        .pif-overlay-text { font-size: 11px; font-weight: 700; }
        .pif-progress-track {
          width: 64px; height: 3px; border-radius: 999px;
          background: rgba(255,255,255,0.35); overflow: hidden;
        }
        .pif-progress-fill {
          display: block; height: 100%; background: #fff;
          border-radius: 999px; transition: width .25s ease;
        }
        .pif-retry-btn {
          border: none; border-radius: 7px; cursor: pointer;
          background: #fff; color: #b91c1c;
          font-size: 10.5px; font-weight: 700;
          padding: 3px 8px; display: flex; align-items: center; gap: 4px;
        }
        .pif-retry-btn:hover { background: #fee2e2; }

        .pif-chip {
          position: absolute; left: 5px; bottom: 5px;
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 9.5px; font-weight: 700;
          padding: 2px 6px; border-radius: 999px;
          background: rgba(15, 23, 42, 0.7); color: #fff;
          max-width: calc(100% - 10px);
        }
        .pif-chip--done { background: rgba(22, 163, 74, 0.92); }
        .pif-chip--saved { background: rgba(15, 23, 42, 0.7); }

        .pif-star-btn,
        .pif-remove-btn {
          position: absolute; top: 5px;
          width: 24px; height: 24px; border: none; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10.5px; color: #fff; cursor: pointer;
          background: rgba(15, 23, 42, 0.55); transition: background .2s, transform .2s;
        }
        .pif-star-btn { left: 5px; }
        .pif-remove-btn { right: 5px; }
        .pif-star-btn[data-active="true"] { background: #f59e0b; }
        .pif-star-btn:hover { transform: scale(1.08); }
        .pif-remove-btn:hover { background: #dc2626; transform: scale(1.08); }

        .pif-rejections {
          list-style: none; margin: 0 0 12px; padding: 0;
          display: flex; flex-direction: column; gap: 6px;
        }
        .pif-rejections li {
          display: flex; align-items: flex-start; gap: 8px;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 9px; padding: 8px 10px;
        }
        .pif-rejection-icon { color: #dc2626; font-size: 12px; margin-top: 2px; }
        .pif-rejection-text {
          flex: 1; font-size: 11.5px; line-height: 1.45; color: #b91c1c;
          word-break: break-word;
        }
        .pif-rejection-close {
          border: none; background: transparent; color: #dc2626;
          cursor: pointer; font-size: 11px; padding: 2px;
        }

        .pif-dropzone {
          border: 2px dashed #cbd5e1; border-radius: 14px;
          padding: 30px 20px; text-align: center;
          cursor: pointer; transition: all .2s; background: #f8fafc;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .pif-dropzone:hover,
        .pif-dropzone:focus-visible,
        .pif-dropzone--active {
          border-color: #0284c7; background: #eff8ff; outline: none;
        }
        .pif-dropzone[data-disabled="true"] {
          cursor: not-allowed; opacity: .6;
        }
        .pif-dropzone-icon {
          font-size: 34px; color: #94a3b8; margin-bottom: 6px; transition: .2s;
        }
        .pif-dropzone:hover .pif-dropzone-icon,
        .pif-dropzone--active .pif-dropzone-icon { color: #0284c7; }
        .pif-dropzone-text { font-size: 14px; color: #475569; }
        .pif-dropzone-hint { font-size: 11.5px; color: #94a3b8; }

        .pif-file-input { display: none; }

        @media (max-width: 480px) {
          .pif-dropzone { padding: 20px 14px; }
          .pif-thumb { width: 80px; height: 80px; }
        }
      `}</style>
    </div>
  );
};

export default ProductImageField;

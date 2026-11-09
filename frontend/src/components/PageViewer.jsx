import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronLeft, faChevronRight, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const PageViewer = ({ pages, index, onClose, onNavigate }) => {
  const [zoom, setZoom] = useState(1);
  const page = pages[index];

  const prev = useCallback(() => {
    onNavigate(Math.max(0, index - 1));
  }, [index, onNavigate]);

  const next = useCallback(() => {
    onNavigate(Math.min(pages.length - 1, index + 1));
  }, [index, pages.length, onNavigate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, z + 0.5));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    setZoom(1);
  }, [index]);

  if (!page) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 text-white">
        <span className="font-montserrat text-sm">
          Page {page.page_no} <span className="text-slate-400">({index + 1} of {pages.length})</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Zoom out"
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Zoom in"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition ml-2" aria-label="Close">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <img
          src={page.full_url || page.image_url}
          alt={`Catalogue page ${page.page_no}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          className="max-w-full h-auto transition-transform duration-200 select-none"
          draggable={false}
        />
      </div>

      <button
        onClick={prev}
        disabled={index === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-sky-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
      </button>
      <button
        onClick={next}
        disabled={index === pages.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-sky-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
      </button>
    </div>
  );
};

export default PageViewer;

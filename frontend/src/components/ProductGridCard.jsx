import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";
import { catalogueImg, parseImages, PLACEHOLDER_IMG } from "../utils/cloudinaryImage";
import { inr } from "../utils/format";

// One compact card for every product grid in the shop: 3:2 photo, meta line,
// name, then price with an inline add control. Used by the catalogue product
// list and the all-products page so the two never drift apart.
const ProductGridCard = ({
  product,
  companyName = "",
  onViewPage,
  onImageClick,
  enforceStock = false,
}) => {
  const { addToCart } = useCart();

  const images = parseImages(product.img_url);
  const outOfStock = enforceStock && !product.stock;
  const meta = [companyName, product.code].filter(Boolean).join(" · ");

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img_url: product.img_url,
      stock: product.stock,
      // The cart row prints the company, so keep it on the line item.
      company_name: companyName,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div
        className={`relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden bg-slate-50 p-1.5 ${
          onImageClick ? "cursor-pointer" : ""
        }`}
        onClick={onImageClick ? () => onImageClick(product.img_url) : undefined}
        title={onImageClick ? "Click to view all images" : undefined}
      >
        {images.length > 1 && (
          <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded-full bg-sky-950/80 px-1.5 py-0.5 font-montserrat text-[9px] font-bold text-white">
            {images.length} Images
          </span>
        )}
        {product.catalogue_page && onViewPage && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewPage(product.catalogue_page);
            }}
            title="View in catalogue"
            className="absolute left-1.5 top-1.5 z-10 rounded-full bg-sky-950/80 px-1.5 py-0.5 font-montserrat text-[9px] font-bold text-white transition hover:bg-sky-700"
          >
            Pg {product.catalogue_page}
          </button>
        )}
        <img
          src={catalogueImg(images[0], 400) || PLACEHOLDER_IMG}
          alt={product.name}
          loading="lazy"
          className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-1.5">
        {meta && (
          <p className="truncate font-montserrat text-[9px] uppercase tracking-wide text-slate-400">
            {meta}
          </p>
        )}
        <h5 className="font-montserrat text-[13px] font-semibold leading-snug text-slate-800 line-clamp-2">
          {product.name}
        </h5>

        <div className="mt-auto flex items-center justify-between gap-1.5 pt-2">
          <p className="min-w-0 truncate font-montserrat text-[13px] font-bold text-sky-900">
            {inr(product.price)}
          </p>
          {outOfStock ? (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 font-montserrat text-[10px] font-semibold text-red-500">
              Restocking
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              title={`Add ${product.name} to cart`}
              aria-label={`Add ${product.name} to cart`}
              className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-sky-700 px-2.5 font-montserrat text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-sky-800 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGridCard;

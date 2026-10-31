import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import ImageModal from "./ImageModal";
import { useCart } from "../context/CartContext";

const PopularProductCard = ({ img_url, name, price, product, stock }) => {
  const { addToCart } = useCart();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const productName = name || "";
  const isLongName = productName.length > 20;

  let parsedImages = [];
  try {
    parsedImages = typeof img_url === "string" && img_url.startsWith("[")
      ? JSON.parse(img_url)
      : img_url
        ? [img_url]
        : [];
  } catch {
    parsedImages = img_url ? [img_url] : [];
  }

  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
      <div
        className="w-full aspect-square bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden mb-4 relative cursor-pointer"
        onClick={() => setIsImageModalOpen(true)}
        title="Click to view all images"
      >
        {parsedImages.length > 1 && (
          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none">
            {parsedImages.length} Images
          </div>
        )}
        <img
          src={parsedImages[0] || ""}
          alt={productName}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <h3
          className={`${isLongName ? "text-lg md:text-xl" : "text-xl md:text-2xl"
            } leading-snug font-semibold font-palanquin text-slate-800 mb-2 line-clamp-2`}
        >
          {productName}
        </h3>

        <div className="mt-auto">
          <p className="font-bold font-montserrat text-sky-900 text-lg md:text-xl mb-2">
            ₹{Math.floor(Number(price) || 0)}
          </p>
          {!stock ? (
            <div className="w-full text-center bg-red-50 text-red-500 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold">
              Restocking soon
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="w-full bg-sky-700 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faCartPlus} />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      <ImageModal
        images={parsedImages}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
};

export default PopularProductCard;

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faMinus,
  faPlus,
  faShoppingCart,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";
import { catalogueImg, parseImages, PLACEHOLDER_IMG } from "../utils/cloudinaryImage";
import { inr } from "../utils/format";

// Header cart control: the icon opens a mini cart directly underneath it.
// All cart mutation still goes through CartContext, so this is a view only.
const CartButton = ({ iconClassName = "text-lg" }) => {
  const { cart, isCartOpen, openCart, closeCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
    0
  );

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeCart();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCart();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const goToCartPage = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (isCartOpen ? closeCart() : openCart())}
        aria-haspopup="true"
        aria-expanded={isCartOpen}
        aria-label={`View cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        className="flex items-end group relative"
      >
        <FontAwesomeIcon
          icon={faShoppingCart}
          className={`${iconClassName} hover:text-cyan-600 cursor-pointer`}
        />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
        <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
          Cart
        </span>
      </button>

      {isCartOpen && (
        <div
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="cart-dropdown absolute right-0 top-full z-[70] mt-3 w-[19rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white text-left text-slate-800 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
            <div>
              <p className="font-palanquin text-sm font-bold text-sky-950">Your cart</p>
              <p className="font-montserrat text-[11px] text-slate-500">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-sky-900"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-7 text-center">
              <FontAwesomeIcon icon={faShoppingCart} className="mb-2 text-xl text-slate-300" />
              <p className="font-montserrat text-xs text-slate-500">Your cart is empty.</p>
            </div>
          ) : (
            <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto px-3">
              {cart.map((item) => {
                const image = parseImages(item.img_url)[0] || PLACEHOLDER_IMG;
                const unitPrice = Number(item.price || 0);

                return (
                  <li key={item.id} className="flex gap-2.5 py-2.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-slate-50 p-0.5">
                      <img
                        src={catalogueImg(image, 160)}
                        alt={item.name}
                        className="max-h-full w-auto object-contain"
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-montserrat text-[12px] font-semibold leading-snug text-slate-800 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="mt-0.5 font-montserrat text-[11px] text-slate-500">
                        {inr(unitPrice)}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded bg-gray-100 px-0.5 py-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity <= 1
                                ? removeFromCart(item.id)
                                : updateQuantity(item.id, item.quantity - 1)
                            }
                            title={
                              item.quantity <= 1
                                ? `Remove ${item.name} from cart`
                                : `Reduce quantity of ${item.name}`
                            }
                            aria-label={
                              item.quantity <= 1
                                ? `Remove ${item.name} from cart`
                                : `Decrease quantity of ${item.name}`
                            }
                            className="flex h-6 w-6 items-center justify-center rounded text-sky-800 transition hover:bg-white hover:text-sky-950 active:scale-90"
                          >
                            <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                          </button>
                          <span className="min-w-[1.25rem] text-center font-montserrat text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            title={`Add another ${item.name}`}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-6 w-6 items-center justify-center rounded text-sky-800 transition hover:bg-white hover:text-sky-950 active:scale-90"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                          </button>
                        </div>
                        <span className="font-montserrat text-[12px] font-bold text-sky-900">
                          {inr(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      title={`Remove ${item.name} from cart`}
                      aria-label={`Remove ${item.name} from cart`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center self-start rounded text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-90"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-gray-100 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between font-montserrat">
              <span className="text-[11px] text-slate-600">Total</span>
              <span className="text-sm font-bold text-sky-950">{inr(totalPrice)}</span>
            </div>
            <button
              type="button"
              onClick={goToCartPage}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-700 px-3 py-2 font-montserrat text-xs font-semibold text-white shadow-sm transition hover:bg-sky-800 active:scale-[0.98]"
            >
              View all products
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartButton;

import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSpinner, faTrash, faMinus, faPlus, faUndo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, clearCart, updateQuantity, removeFromCart, addToCart } = useCart();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [recentlyRemoved, setRecentlyRemoved] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    if (recentlyRemoved) {
      timeout = setTimeout(() => {
        setRecentlyRemoved(null);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [recentlyRemoved]);

  const handleRemove = (item) => {
    removeFromCart(item.id);
    setRecentlyRemoved(item);
  };

  const handleUndo = () => {
    if (recentlyRemoved) {
      // Add the item back with its previous quantity
      const itemToAdd = { ...recentlyRemoved };
      // we need to call addToCart but addToCart defaults to quantity 1 if new. 
      // Actually we have a custom addToCart that increments by 1 if existing.
      // So we can just add it back and set its quantity.
      addToCart(itemToAdd);
      // after adding it, update its quantity to what it was
      setTimeout(() => updateQuantity(itemToAdd.id, itemToAdd.quantity), 0);
      setRecentlyRemoved(null);
    }
  };

  const confirmOrder = async () => {
    const userId = sessionStorage.getItem("id");
    if (!userId) {
      setOrderError("You must be logged in to place an order.");
      return;
    }

    setOrderLoading(true);
    setOrderError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const payload = {
        userId,
        orderDetails: {
          cartItems: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };

      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setOrderConfirmed(true);
      setTimeout(() => {
        setOrderConfirmed(false);
        clearCart();
        navigate("/profile/orders"); // redirect to orders page after success
      }, 2000);
    } catch (err) {
      console.error("Order error:", err);
      setOrderError(err.message || "Something went wrong. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-16 px-4 md:px-16 bg-slate-50 font-montserrat">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold font-palanquin mb-8 text-sky-950 border-b pb-4">
          Your Cart
        </h2>

        {recentlyRemoved && (
          <div className="bg-sky-100 text-sky-800 p-4 rounded-lg flex justify-between items-center shadow mb-6 animate-pulse">
            <span>
              <strong>{recentlyRemoved.name}</strong> was removed from your cart.
            </span>
            <button
              onClick={handleUndo}
              className="bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-800 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUndo} /> Undo
            </button>
          </div>
        )}

        {cart.length === 0 && !orderConfirmed ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-sky-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-4"
              >
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                  <img
                    src={item.img_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded shadow"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-lg block">
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-500 block">
                      Company: {item.company_name}
                    </span>
                    <span className="text-sm font-medium text-sky-700 mt-1 block">
                      ₹{item.price} x {item.quantity}
                    </span>
                    <div className="flex items-center gap-3 mt-3 bg-gray-100 rounded px-2 py-1 w-max">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="text-sky-700 hover:text-sky-900 disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="font-semibold text-gray-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-sky-700 hover:text-sky-900"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-sky-900 text-xl">
                      ₹{item.price * item.quantity}
                    </span>
                    <button
                      onClick={() => handleRemove(item)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}


            {!orderConfirmed && cart.length > 0 && (
              <>
                <div className="flex justify-between items-center pt-6 font-bold text-2xl mt-8 border-t-2 border-gray-200 text-sky-950">
                  <span>Total Amount:</span>
                  <span>
                    ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                  </span>
                </div>

                {orderError && (
                  <div className="bg-red-100 text-red-700 border border-red-300 p-4 rounded-lg text-md mt-6">
                    {orderError}
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    onClick={confirmOrder}
                    disabled={orderLoading}
                    className="w-full md:w-auto px-12 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {orderLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        Placing Order...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </button>
                </div>
              </>
            )}

            {orderConfirmed && (
              <div className="bg-green-100 text-green-800 p-8 rounded-lg text-center font-bold text-2xl animate-pulse mt-8 shadow-inner border border-green-200">
                <FontAwesomeIcon icon={faCheck} className="mr-3 text-3xl" />
                Your order has been confirmed successfully!
                <p className="text-sm mt-4 font-normal text-green-700">
                  Redirecting to your orders...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;

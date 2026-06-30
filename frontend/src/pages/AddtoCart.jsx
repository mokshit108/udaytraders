import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Nav from "../components/nav/Nav";
import { useNavigate } from "react-router-dom";
import ProductItem from "../components/cart/ProductItem";
import ApplyCoupon from "../components/ApplyCoupon";
import CartTotal from "../components/cart/CartTotal";

const AddtoCart = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, addToCart, setDiscountPercentage, appliedCoupon, setAppliedCoupon } = useCart();
  const [updatedCartItems, setUpdatedCartItems] = useState(cartItems);
  const [cartModified, setCartModified] = useState(false);
  const [initialQuantities, setInitialQuantities] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removedItem, setRemovedItem] = useState(null);

  useEffect(() => {
    setUpdatedCartItems(cartItems);
    const initialQuantitiesObj = {};
    cartItems.forEach((item) => {
      initialQuantitiesObj[item.id] = item.quantity;
    });
    setInitialQuantities(initialQuantitiesObj);

    // Load applied coupon from sessionStorage if exists
    const storedCoupon = sessionStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      setAppliedCoupon(storedCoupon);
    }

    const storedDiscount = sessionStorage.getItem('discountPercentage');
    if (storedDiscount) {
      setDiscountPercentage(storedDiscount);
    }
  }, [cartItems, setAppliedCoupon, setDiscountPercentage]);


  const handleQuantityChange = (productId, newQuantity) => {
    const updatedItems = updatedCartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setUpdatedCartItems(updatedItems);
    setCartModified(true);
  };

  const handleUpdateCart = () => {
    setIsUpdating(true);
    updatedCartItems.forEach((item) => {
      updateCartItemQuantity(item.id, item.quantity);
    });
    setCartModified(false);
    setIsUpdating(false);
    setUpdateSuccess(true);
    setTimeout(() => {
      setUpdateSuccess(false);
    }, 3000);
  };

  const handleRemoveFromCart = (productId) => {
    const itemToRemove = updatedCartItems.find((item) => item.id === productId);
    setIsRemoving(true);
    setRemovedItem(itemToRemove);
    removeFromCart(productId);
    const updatedItems = updatedCartItems.filter(
      (item) => item.id !== productId
    );
    setUpdatedCartItems(updatedItems);
    setCartModified(true);
    setTimeout(() => {
      setIsRemoving(false);
    }, 500);
    setTimeout(() => {
      setRemovedItem(null);
    }, 10000);
  };

  const handleUndoRemove = () => {
    if (removedItem) {
      addToCart(removedItem);
      setUpdatedCartItems([...updatedCartItems, removedItem]);
      setRemovedItem(null);
    }
  };


  const subtotal = updatedCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const navigate = useNavigate();
  const handleCheckout = () => {
    navigate("/checkout");
  };

  const navigatehome = () => {
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="container mx-auto py-10 padding">
        {updateSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mt-20">
            <p>Cart updated successfully!</p>
          </div>
        )}
        
        {removedItem && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex justify-between items-center mt-10 max-md:mt-16">
            <p>
              Removed {removedItem.name}.{" "}
              <button
                className="underline text-sky-950"
                onClick={handleUndoRemove}
              >
                Undo
              </button>
            </p>
          </div>
        )}
        {updatedCartItems.length > 0 && (
          <>
            <h3 className="max-md:text-3xl max-sm:padding text-4xl font-palanquin font-bold p-4 text-sky-950">
              Cart
            </h3>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-3/5 md:pr-4">
                <div className="">
                  <ProductItem
                    handleRemoveFromCart={handleRemoveFromCart}
                    handleQuantityChange={handleQuantityChange}
                    initialQuantities={initialQuantities}
                    updatedCartItems={updatedCartItems}
                    cartModified={cartModified}
                    isUpdating={isUpdating}
                    handleUpdateCart={handleUpdateCart}
                  />
                </div>
                {!appliedCoupon && (
                  <ApplyCoupon
                  />
                )}
                {couponSuccess && (
                  <div className="text-green-600 text-center my-4 mt-20">
                    Coupon applied successfully!
                  </div>
                )}
              </div>
              <CartTotal
                subtotal={subtotal}
                handleCheckout={handleCheckout}
              />
            </div>
          </>
        )}
        {updatedCartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-screen padding">
            <p className="text-gray-800 text-center font-palanquin text-4xl mb-6 max-md:text-2xl">Your cart is empty.</p>
            <button
              onClick={navigatehome}
              className="bg-sky-950 text-white text-lg px-4 py-3 rounded hover:bg-sky-700"
            >
              Back to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddtoCart;

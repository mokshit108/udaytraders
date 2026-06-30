import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext"; // Import your CartContext hook
import { useNavigate } from "react-router-dom";
import { FaTimes } from 'react-icons/fa';
import ApplyCoupon from "../ApplyCoupon"; // Import ApplyCoupon component

const OrderCard = ({ username }) => { // Receive username as a prop
  const { cartItems, appliedCoupon, setAppliedCoupon, discountPercentage, setDiscountPercentage, finalAmount, totalAmount } = useCart(); // Access cartItems from CartContext
  const navigate = useNavigate(); // Use useNavigate for navigation

  // Calculate the subtotal
  const shipping = 50; // Fixed shipping cost
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  // Load the coupon from sessionStorage when the component mounts
  useEffect(() => {
    const storedCoupon = sessionStorage.getItem("appliedCoupon");
    const storedDiscount = sessionStorage.getItem("discountPercentage");
    if (storedCoupon && storedDiscount) {
      setAppliedCoupon(storedCoupon);
      setDiscountPercentage(parseFloat(storedDiscount));
    }
  }, [setAppliedCoupon, setDiscountPercentage]);

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    sessionStorage.removeItem('appliedCoupon');
    setDiscountPercentage(0);
    sessionStorage.removeItem('discountPercentage');
    window.location.reload();
  };

  const handlePlaceOrder = () => {
    const checkoutFormDetails = JSON.parse(sessionStorage.getItem("checkoutFormDetails") || "{}");

    // Check if checkoutFormDetails is an empty object or if any of its fields are empty
    const requiredFields = ['firstName', 'lastName', 'streetAddress1', 'streetAddress2', 'station', 'pincode', 'phone']; // Add all your required field keys here
    const allFieldsFilled = requiredFields.every(field => checkoutFormDetails[field] && checkoutFormDetails[field].trim() !== "");

    if (!allFieldsFilled) {
      setErrorMessage("Please fill all the fields in the checkout form.");
      return;
    }

    if (username) {
      sessionStorage.setItem('orderDetails', JSON.stringify({ cartItems, finalAmount }));
      navigate("/payment");
      window.location.reload();
    } else {
      setErrorMessage("Please log in to place an order.");
    }
  };

  return (
    <div className="border shadow-lg rounded-lg bg-white text-black text-base font-semibold p-10">
      <h3 className="font-palanquin font-semibold text-sky-950 text-2xl mb-8">
        Your Order
      </h3>

      {/* Display error message */}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-8 mb-3">
        <div className="flex flex-row border-b pb-2 text-start text-gray-600 font-semibold">
          <p className="w-1/3">Product</p>
          <p className="w-1/4 text-center">Subtotal</p>
        </div>
      </div>

      {cartItems.map((item) => (
        <div key={item.id} className="flex py-4">
          <p className="w-1/3">{item.name} x {item.quantity}</p>
          <p className="w-1/4 text-center">₹{item.price * item.quantity}</p>
        </div>
      ))}

      <div className="flex py-4 border-t mt-4">
        <p className="w-1/3 text-gray-600">Subtotal</p>
        <p className="w-1/4 text-center">₹{subtotal}</p>
      </div>

      <div className="flex py-4">
        <p className="w-1/3 text-gray-600">Shipping</p>
        <p className="w-1/4 text-center">₹{shipping}</p>
      </div>

      {appliedCoupon && (
        <div className="flex py-4">
          <p className="w-1/3 text-gray-600">Discount ({discountPercentage}%):</p>
          <p className="w-1/4 text-center">-₹{(totalAmount * discountPercentage) / 100}</p>
        </div>
      )}

      {appliedCoupon && (
        <div className="flex mb-4 mt-5">
          <p className="w-1/3 text-gray-600">Coupon:</p>
          <div className="w-1/4 text-center">
            <p>{appliedCoupon}
              <button
                className="ml-1 text-red-500 text-base content-center hover:text-red-700"
                onClick={handleRemoveCoupon}
              >
                <FaTimes />
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="flex py-4 border-t font-semibold">
        <p className="w-1/3 text-gray-600">Total</p>
        <p className="w-1/4 text-center">₹{finalAmount.toFixed(2)}</p>
      </div>

      <button
        className="bg-sky-950 text-white font-normal px-4 py-2 rounded-sm w-full mt-4 hover:bg-sky-700"
        onClick={handlePlaceOrder}
      >
        Place Order
      </button>

      {/* ApplyCoupon Component */}
      <ApplyCoupon
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        setDiscountPercentage={setDiscountPercentage}
      />
    </div>
  );
};

export default OrderCard;

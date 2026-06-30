import { useContext} from 'react';
import { CartContext } from '../../context/CartContext';
import { FaTimes } from 'react-icons/fa';

const CartTotal = ({
  subtotal,
  handleCheckout
}) => {
  const { appliedCoupon, setAppliedCoupon , discountPercentage, setDiscountPercentage, finalAmount, totalAmount } = useContext(CartContext);
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    sessionStorage.removeItem('appliedCoupon');
    setDiscountPercentage(0);
    sessionStorage.removeItem('discountPercentage');
    window.location.reload();
  };

  const shipping = 50;

  return (
    
    <div
      className="w-full lg:w-[37%] mt-4 border p-6 shadow-lg rounded-lg bg-white text-gray-600 font-bold"
      style={{ height: "calc(100% - 3.5rem)" }}
    >
      <h3 className="text-lg font-bold text-sky-950 mb-4 mt-2 font-palanquin">
        Cart Totals
      </h3>
      <div className="flex justify-between mb-4 mt-10">
        <span>Subtotal:</span>
        <span>₹{subtotal}</span>
      </div>
      <div className="flex justify-between mb-4 mt-5">
        <span>Shipping Charge:</span>
        <span>₹{shipping}</span>
      </div>
      {appliedCoupon && (
        <div className="flex justify-between mb-4 mt-5">
          <span>Discount ({discountPercentage}%):</span>
          <span>- ₹{(totalAmount * discountPercentage) / 100}</span>
        </div>
      )}
      {appliedCoupon && (
        <div className="flex justify-between items-center mb-4 mt-5">
          <span>Coupon:</span>
          <div className="flex items-center">
            <span>{appliedCoupon}</span>
            <button
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={handleRemoveCoupon}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between border-t pt-4">
        <span>Total:</span>
        <span>₹{finalAmount.toFixed(2)}</span>
      </div>
      <button
        onClick={handleCheckout}
        className="bg-sky-950 text-white font-normal px-4 py-2 rounded-sm w-full mt-4 hover:bg-sky-700"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartTotal;

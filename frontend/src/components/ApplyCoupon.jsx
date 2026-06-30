import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ApplyCoupon = () => {
  const { appliedCoupon, setAppliedCoupon, setDiscountPercentage } =
    useContext(CartContext);
  const [couponCode, setCouponCode] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponError, setCouponError] = useState(false);

  const handleApplyCoupon = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/coupons/validate-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.valid) {
          setCouponSuccess(true);
          setDiscountPercentage(data.discount_percentage);
          // Delay setting appliedCoupon to ensure the success message shows
          setTimeout(() => {
            setAppliedCoupon(couponCode);
            sessionStorage.setItem("appliedCoupon", couponCode);
            sessionStorage.setItem(
              "discountPercentage",
              data.discount_percentage
            );
          }, 2000);
        } else {
          setCouponError(true);
        }
      } else {
        console.error("Error validating coupon:", data.message);
        setCouponError(true);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(true);
    }

    setTimeout(() => {
      setCouponSuccess(false);
      setCouponError(false);
    }, 3000);
  };

  return (
    <>
      {!appliedCoupon && (
        <div className="w-full mt-8 border p-6 shadow-lg rounded-lg bg-white text-gray-600 font-semibold flex flex-col md:flex-row items-start md:items-center">
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="w-full md:w-[70%] border rounded mb-2 md:mb-0 md:mr-2 p-2"
            style={{ border: "none", outline: "none" }}
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-sky-950 text-white font-semibold px-4 py-2 rounded-sm hover:bg-sky-700 w-full md:w-[30%]"
          >
            Apply Coupon
          </button>
        </div>
      )}
      {couponSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mt-5">
          <p>Coupon applied successfully!</p>
        </div>
      )}
      {couponError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mt-5">
          <p>Invalid coupon code. Please try again.</p>
        </div>
      )}
    </>
  );
};

export default ApplyCoupon;

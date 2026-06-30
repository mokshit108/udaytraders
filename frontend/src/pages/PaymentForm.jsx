import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

const PaymentForm = () => {
  const { discountPercentage, cartItems, totalAmount, finalAmount  } = useCart();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // const subtotal = cartItems.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );
  // const shipping = 50;
  // const total = subtotal + shipping - (subtotal * discountPercentage) / 100;

  const handlePayment = async () => {
    if (!window.Razorpay) {
      console.error("Razorpay script not loaded");
      return;
    }

    try {
      const checkoutFormDetails = JSON.parse(sessionStorage.getItem('checkoutFormDetails'));
      const orderDetails = JSON.parse(sessionStorage.getItem('orderDetails'));
      const userId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!checkoutFormDetails || !orderDetails || !userId) {
        console.error("Missing required data:", {
          checkoutFormDetails,
          orderDetails,
          userId,
        });
        return;
      }

      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ensure token is included
        },
        body: JSON.stringify({ checkoutFormDetails, orderDetails, userId }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { order_id } = await orderResponse.json();

      const options = {
        key: "rzp_live_dhHJYQSrLGf27f",
        amount: finalAmount * 100,
        currency: "INR",
        order_id: order_id,
        name: "Mokshit Shah",
        description: "Order Payment",
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              `${apiUrl}/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyResponse.ok) {
              // Save payment details
              const saveResponse = await fetch(`${apiUrl}/save-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  method: "Razorpay",
                  userId: userId,
                  total_amount: totalAmount,
                  final_amount: finalAmount,
                  discountPercentage: discountPercentage,
                }),
              });
              if (saveResponse.ok) {
              sessionStorage.removeItem("appliedCoupon");
              sessionStorage.removeItem("discountPercentage");
              sessionStorage.removeItem("cartItems");
              sessionStorage.removeItem("orderDetails");
              navigate('/success');
              window.location.reload();
              }
              else{
                console.error("not able to save in databse:", await saveResponse.text());
              }
            } else {
              console.error("Error processing payment:", await verifyResponse.text());
            }
          } catch (error) {
            console.error("Error:", error);
          }
        },
        prefill: {
          name: checkoutFormDetails.firstName,
          contact: checkoutFormDetails.phone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isValid) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-bold text-red-600">{errorMessage}</h2>
        <button
          onClick={() => navigate("/order")}
          className="mt-4 bg-sky-950 text-white font-normal px-4 py-2 rounded-sm hover:bg-sky-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section id="payment-form" className="padding">
      <div className="max-lg:mt-16 border rounded-lg align-middle bg-white text-black text-base font-semibold p-10 shadow-3xl shadow-slate-300 mt-10 text-center md:mx-40">
        <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold p-2 text-sky-950 text-center">
          Payment
        </h3>
        <p className="max-md:text-sm my-4 font-montserrat">
          We are working on other payment options.
        </p>
        <p className="max-md:text-xl mb-4 font-semibold text-2xl mt-14 font-montserrat">
          Total Amount: ₹{finalAmount}
        </p>
        <p className="max-md:text-sm my-8 font-montserrat">
          For now, you can use Razorpay for payment.
        </p>
        <button
          onClick={handlePayment}
          className="bg-sky-950 text-white font-normal px-4 py-2 rounded-sm w-[50%] mt-4 hover:bg-sky-700"
        >
          Pay Now
        </button>
      </div>
    </section>
  );
};

export default PaymentForm;

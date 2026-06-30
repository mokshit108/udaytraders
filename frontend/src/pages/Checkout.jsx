
import Nav from "../components/nav/Nav";
import LoginCard from "../components/checkout/LoginCard";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderCard from "../components/checkout/OrderCard";
import { CartProvider } from "../context/CartContext"; // Ensure correct path
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {

  const username = sessionStorage.getItem("username"); // Get the username from local storage
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const navigatehome = () => {
    navigate("/");
  }



  return (
    <CartProvider>
      <Nav />
      {cartItems.length > 0 && (
        <section id="checkouts" className="padding">
          <h3 className="max-md:text-3xl max-sm:padding text-4xl font-palanquin font-bold p-4 text-sky-950">
            Checkout
          </h3>
          <div className="flex flex-col min-h-screen bg-white lg:flex-row">
            <div className="flex-1 flex flex-col w-full lg:w-[60%]">
              {!username && <LoginCard />} {/* Show LoginCard only if user is not logged in */}
              <CheckoutForm />
            </div>
            <div className="flex-1 flex flex-col w-full lg:w-[35%] lg:ml-5">
              <OrderCard username={username} />
            </div>
          </div>
        </section>
      )}
      {cartItems.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-screen padding">
          <p className="text-gray-800 text-center font-palanquin text-4xl mb-6">Your cart is empty.</p>
          <button
            onClick={navigatehome}
            className="bg-sky-950 text-white text-lg px-4 py-3 rounded hover:bg-sky-700"
          >
            Back to Home
          </button>
        </div>
      )}
    </CartProvider>

  );
};

export default Checkout;

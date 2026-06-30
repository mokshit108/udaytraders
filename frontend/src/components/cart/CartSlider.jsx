
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // Correct import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons"; // FontAwesome X icon
import { close } from "../../assets/icons";

const CartSlider = ({ cartSidebarOpen, toggleCartSidebar }) => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart(); // Assuming removeFromCart is a function in your CartContext

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleViewCart = () => {
    toggleCartSidebar();
    navigate("/cart");
  };

  const handleCheckout = () => {
    toggleCartSidebar();
    navigate("/checkout");
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full font-montserrat ${
        cartSidebarOpen ? "w-2/3 sm:w-[40%] md:w-[40%] lg:w-[28%]" : ""
      } mt-4 rounded-md bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        cartSidebarOpen ? "translate-x-0" : "translate-x-full"
      } overflow-y-auto`}
    >
      <div className="relative">
        <button
          onClick={toggleCartSidebar}
          className="absolute top-0 right-0 text-gray-700 text-xl focus:outline-none mt-2 mr-2"
        >
          <img
            src={close}
            alt="close icon"
            width={25}
            height={25}
            className="cursor-pointer"
          />
        </button>
      </div>
      <div className="p-6">
        <h2 className="text-lg font-semibold m-4 text-center">My Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-700">No items in cart.</p>
        ) : (
          <ul className="space-y-4">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between border p-4 rounded-lg shadow"
              >
                <img
                  src={item.img_url}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover mr-4"
                />
                <div className="flex flex-col flex-grow">
                  <p className="text-gray-800 font-semibold">{item.name}</p>
                  <p className="text-gray-800 font-semibold">
                    {item.quantity}&nbsp;x&nbsp;₹{item.price}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.id)} // Assuming item.id is unique for each product
                  className="text-gray-700 text-xl focus:outline-none hover:text-sky-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length > 0 && (
          <>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-center">Subtotal: ₹{calculateSubtotal()}</h3>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <button
                onClick={handleViewCart}
                className="bg-sky-950 text-white px-4 py-2 rounded-sm w-full hover:bg-sky-700 mb-2"
              >
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="bg-sky-950 w-full text-white px-4 py-2 rounded-sm hover:bg-sky-700"
              >
                Checkout
              </button>
            </div>
          </>
        )}
        <div className="mb-4"></div>
      </div>
    </div>
  );
};

export default CartSlider;

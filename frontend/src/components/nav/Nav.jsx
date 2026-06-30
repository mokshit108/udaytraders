import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import NavMobile from "./NavMobile";
import NavLarge from "./NavLarge";
import CartSlider from "../cart/CartSlider";
import useSessionTimeout from "../../hooks/useSessionTimeout";
import '../../index.css';
import TypingCarousel  from "./TypingCarousel";

const Nav = () => {
  const { cartItems, clearCart } = useContext(CartContext); // Destructure clearCart from CartContext
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useSessionTimeout(); // Pass login status to the hook

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleCartSidebar = () => {
    setCartSidebarOpen(!cartSidebarOpen);
  };

  // eslint-disable-next-line no-unused-vars
  const closeSidebarAndNavigateHome = () => {
    setCartSidebarOpen(false);
    navigate("/"); // Navigate to home
  };

  const logout = () => {
    sessionStorage.clear();
    // Clear the cart items
    clearCart(); // Clear the cart items using context
    navigate("/login"); // Redirect to login page
    window.location.reload();
  };

  const username = sessionStorage.getItem("username");
  const roleid = sessionStorage.getItem("roleid");

  return (
    <>
   
 <header className="py-5 absolute z-10 w-full bg-sky-950 text-white font-semibold lg:fixed">
 <TypingCarousel style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50 }} />
     <NavLarge
          username={username}
          location={location}
          toggleCartSidebar={toggleCartSidebar}
          logout={logout}
        />
        <div className="md:hidden">
          <NavMobile
            username={username}
            roleid={roleid}
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
            toggleCartSidebar={toggleCartSidebar}
            logout={logout}
          />
        </div>
      </header>

      <CartSlider
        cartSidebarOpen={cartSidebarOpen}
        toggleCartSidebar={toggleCartSidebar}
        cartItems={cartItems}
      />

      {cartSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleCartSidebar}
        ></div>
      )}
    </>
  );
};

export default Nav;

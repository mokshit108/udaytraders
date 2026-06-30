import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavMobile from "./NavMobile";
import NavLarge from "./NavLarge";
import useSessionTimeout from "../../hooks/useSessionTimeout";
import '../../index.css';
import TypingCarousel  from "./TypingCarousel";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useSessionTimeout(); // Pass login status to the hook

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };



  const logout = () => {
    sessionStorage.clear();
    // Clear the cart items
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
          logout={logout}
        />
        <div className="md:hidden">
          <NavMobile
            username={username}
            roleid={roleid}
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
            logout={logout}
          />
        </div>
      </header>


    </>
  );
};

export default Nav;

// App.jsx
import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import GoogleOAuthProvider
import Nav from "./components/nav/Nav";
import {
  Footer,
} from "./sections";
import { CartProvider } from "./context/CartContext";
import { NewArrivals, Cart, ContactUs, LoginCard, Product, ForgotPassword, ResetPassword , Profile, OrderTimeline, NotFound, RegisterPhoneNumber } from "./pages";
import SuccessPage from "./components/SuccessPage";
const App = () => {
  
  return (
    <CartProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        
        <main className="relative">
          <Nav /> {/* Nav does not need cartItems as a prop anymore */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-phone-number" element={<RegisterPhoneNumber />} />
            <Route path="/contact-us" element={<ContactUs />} />

            <Route path="/products" element={<NewArrivals />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<LoginCard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile/*" element={<Profile />} />
            <Route path="/myorder/*" element={<OrderTimeline />} />
            <Route path="/product" element={<Product />} />

            <Route path="/success" element={<SuccessPage/>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </main>
      </Router>
      </GoogleOAuthProvider>
    </CartProvider>
  );
};

const Home = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>

      <section className="min-h-[80vh] pt-28 md:pt-32 pb-12 md:pb-16 px-4 sm:px-6 md:px-8 bg-slate-50 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-palanquin font-bold text-sky-950 mb-4 md:mb-6 text-center leading-tight">
          Welcome to Uday Traders
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-montserrat mb-8 md:mb-12 text-center max-w-md sm:max-w-xl md:max-w-2xl px-2">
          Your one-stop destination for premium products. Explore our catalog below for high-quality supplies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md p-6 sm:p-8 flex flex-col items-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-sky-100 rounded-full mb-4 sm:mb-6 flex items-center justify-center shadow-inner">
                <span className="text-sky-800 font-bold text-lg sm:text-xl">Product {item}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-palanquin mb-2 sm:mb-3 text-center text-slate-800">Dummy Item {item}</h3>
              <p className="text-sm sm:text-base text-slate-500 text-center font-montserrat leading-relaxed">
                This is a placeholder description for Uday Traders dummy product {item}.
              </p>
              <button className="mt-6 sm:mt-8 w-full sm:w-auto bg-sky-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-montserrat font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-md hover:shadow-lg">
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default App;

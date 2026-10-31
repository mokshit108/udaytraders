// App.jsx
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import GoogleOAuthProvider
import Nav from "./components/nav/Nav";
import {
  Footer,
  PopularProducts,
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

const Home = () => (
  <>
    <section className="pt-28 md:pt-32 pb-10 md:pb-14 px-4 sm:px-6 md:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-palanquin font-bold text-sky-950 mb-4 md:mb-6 leading-tight">
          Welcome to Uday Traders
        </h1>
        <p className="text-sm sm:text-lg lg:text-xl text-slate-600 font-montserrat mb-8 md:mb-10 max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-2">
          Your one-stop destination for premium products. Explore our catalog below for high-quality supplies.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center bg-sky-700 text-white px-6 sm:px-8 py-3 rounded-lg font-montserrat font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-md hover:shadow-lg"
        >
          Browse All Products
        </Link>
      </div>
    </section>

    <PopularProducts />
  </>
);

export default App;

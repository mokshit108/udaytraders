// App.jsx
import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import GoogleOAuthProvider
import Nav from "./components/nav/Nav";
import {
  Footer,
} from "./sections";
import { NewArrivals, ContactUs, LoginCard, Product, ForgotPassword, ResetPassword , Profile, OrderTimeline, NotFound, RegisterPhoneNumber } from "./pages";
import SuccessPage from "./components/SuccessPage";
const App = () => {
  
  return (
    <> 
      <GoogleOAuthProvider clientId="1001498681170-m15bo7nppgv2i7p9iifps86i47o3hhgn.apps.googleusercontent.com">
      <Router>
        
        <main className="relative">
          <Nav /> {/* Nav does not need cartItems as a prop anymore */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-phone-number" element={<RegisterPhoneNumber />} />
            <Route path="/contact-us" element={<ContactUs />} />

            <Route path="/products" element={<NewArrivals />} />
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
    </>
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

      <section className="min-h-[80vh] pt-32 pb-16 px-8 bg-slate-50 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-palanquin font-bold text-sky-950 mb-4 text-center">
          Welcome to Uday Traders
        </h1>
        <p className="text-lg text-slate-600 font-montserrat mb-12 text-center max-w-2xl">
          Your one-stop destination for premium products. Explore our catalog below for high-quality supplies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-32 h-32 bg-sky-100 rounded-full mb-4 flex items-center justify-center">
                <span className="text-sky-800 font-bold text-xl">Product {item}</span>
              </div>
              <h3 className="text-2xl font-bold font-palanquin mb-2">Dummy Item {item}</h3>
              <p className="text-slate-500 text-center font-montserrat">
                This is a placeholder description for Uday Traders dummy product {item}.
              </p>
              <button className="mt-6 bg-sky-700 text-white px-6 py-2 rounded hover:bg-sky-800 transition-colors">
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

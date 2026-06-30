// App.jsx
import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import GoogleOAuthProvider
import Nav from "./components/nav/Nav";
import {
  Footer,
  Homehero,
  PopularProducts,
  Services,
  SuperQuality,
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
            <Route path="/new-arrivals" element={<NewArrivals />} />
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
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="fade-in-section"
      >
        <Homehero />
      </section>
      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        className="fade-in-section padding-leftright"
      >
        <PopularProducts />
      </section>
      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="fade-in-section padding-leftright"
      >
        <SuperQuality />
      </section>
      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="fade-in-section padding-leftright mb-4"
      >
        <Services />
      </section>
    </>
  );
};

export default App;

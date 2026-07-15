import Nav from "../components/nav/Nav";
import { ContactSideImg } from "../assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const ContactUs = () => {

  return (
    <>
      <Nav />
      <section
        className="flex pt-28 pb-12 lg:pt-36 lg:pb-20 px-6 md:px-12 lg:px-24 flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 max-w-screen-2xl mx-auto w-full"
      >
        <div className="flex items-center justify-center w-full lg:w-1/2 mb-10 lg:mb-0">
          <img src={ContactSideImg} alt="Contact Us" className="w-full max-w-[450px] xl:max-w-[600px] object-contain drop-shadow-lg" />
        </div>

        <div className="flex justify-center items-center w-full lg:w-1/2 px-2 sm:px-4 lg:px-8">
          <div className="text-center border border-gray-100 bg-white shadow-xl shadow-gray-200/50 relative py-12 px-6 sm:px-10 xl:px-12 w-full max-w-xl xl:max-w-2xl rounded-2xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-palanquin font-bold p-2">
              Contact
              <span className="text-sky-700"> Us </span>
            </h3>
            <p className="font-montserrat text-slate-600 text-sm md:text-base mt-2 mb-6">
              Looking for help? Let us know—we’re here for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-between font-montserrat w-full text-slate-600 mt-4 md:mt-8 gap-6 sm:gap-2">
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faPhone} className="h-5 text-sky-700" />
                </div>
                <span className="font-semibold text-slate-800">+91 8104689015</span>
                <span className="text-xs mt-1 text-slate-500">6 PM to 10 PM</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faWhatsapp} className="h-6 text-green-600" />
                </div>
                <span className="font-semibold text-slate-800">Live Chat</span>
                <span className="text-xs mt-1 text-slate-500">6 PM to 10 PM</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faEnvelope} className="h-5 text-sky-700" />
                </div>
                <span className="font-semibold text-slate-800">Email Us</span>
                <span className="text-xs mt-1 text-slate-500">udaytraders04@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;

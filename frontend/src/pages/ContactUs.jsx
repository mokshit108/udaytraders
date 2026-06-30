
import Nav from "../components/nav/Nav";
import { ContactSideImg } from "../assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import FAQAccordion from "../components/contact/FAQAccordion";
import ContactForm from "../components/contact/ContactForm";

const ContactUs = () => {

  return (
    <>
      <Nav />
      <section
        className="flex padding-topbottom py-8 md:px-8 max-md:mt-16 flex-col lg:flex-row md:gap-8"
      >
        <div className="flex items-center mt-4 justify-center w-full md:flex-1">
          <img src={ContactSideImg} alt="Image" width={650} />
        </div>

        <div className="flex justify-center w-full md:flex-1">
          <div className="text-center border-t-2 border-t-gray-100 shadow-lg shadow-neutral-400 relative py-2 max-lg:py-5">
            <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold p-4">
              Contact
              <span className="text-sky-900"> Us </span>
            </h3>
            <p className=" font-montserrat text-slate-900 text-md mt-4 p-4">
              Looking for help? Let us know—we’re here for you.
            </p>
            <div className="flex justify-between font-montserrat flex-col w-auto text-slate-gray md:flex-row md:mt-8 md:mx-6  md:text-md md:leading-8">
              <div className="flex flex-col m-3">
                <FontAwesomeIcon icon={faPhone} className="h-8 text-black" />
                <span className="my-3 text-black">+91 999999999</span>
                <span>Available at 6PM TO 10 PM</span>
              </div>
              <div className="flex flex-col m-3">
                <FontAwesomeIcon icon={faWhatsapp} className="h-8 text-black" />
                <span className="my-3 text-black">Live chat</span>
                <span>Available at 6PM TO 10 PM</span>
              </div>
              <div className="flex flex-col m-3">
                <FontAwesomeIcon icon={faEnvelope} className="h-8 text-black" />
                <span className="my-3 text-black">Email Us</span>
                <span>We will Get back in 1-2 Days</span>
              </div>
            </div>
            <p className="font-montserrat text-md p-3">
              <span className="font-semibold">Business Queries: </span>
              xxxxxx04@gmail.com
            </p>
          </div>
        </div>
      </section>
      <section
        className="flex flex-col justify-center lg:flex-row lg:min-h-screen lg:px-8 lg:-mt-8"
      >
        <div className="px-8 border-t-2 border-t-gray-100 shadow-lg m-5 shadow-neutral-400 lg:w-1/2 lg:px-8">
          <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold text-center">
            Get In
            <span className="text-sky-900"> Touch </span>
          </h3>
          <p className="mt-4 font-montserrat text-sky-950 text-md">
            Let us know how we can help by completing the form. We typically
            respond in a day.
          </p>

          <ContactForm />
        </div>

        <div className="w-full p-2 lg:w-1/2">
          <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold text-center">
            Top
            <span className="text-sky-900"> FAQ </span>
          </h3>
          <FAQAccordion />
        </div>
      </section>
    </>
  );
};

export default ContactUs;

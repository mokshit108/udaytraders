import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faMedal,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

const ServiceCard = ({ label, subtext }) => {
  const getIcon = () => {
    switch (label) {
      case "Free Estimate":
        return faClipboardList;
      case "Best Selection":
        return faMedal;
      case "Checkout":
        return faShoppingCart;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1  w-full rounded-[20px] shadow-lg shadow-slate-500 border-t-2 border-slate-200 px-6 sm:px-10 py-6 sm:py-10 lg:px-5 lg:py-5 xl:px-10 xl:py-10 flex flex-col items-center">
      <div className="flex justify-center items-center bg-sky-700 rounded-full mb-3 mt-3">
        <div className="max-sm:w-12 max-sm:h-12 w-16 h-16 flex justify-center items-center text-white">
          <FontAwesomeIcon
            icon={getIcon()}
            className="text-2xl md:text-3xl items-center justify-center"
          />
        </div>
      </div>
      <div className="w-full text-center lg:text-left xl:text-center">
        <h3 className="font-palanquin text-2.5xl lg:text-3xl leading-snug sm:leading-normal text-sky-950 font-bold">
          {label}
        </h3>
        <p className="py-3 break-words text-md md:text-xl text-start font-montserrat font-medium text-gray-500 text-md w-full content-fit leading-7 max-md:mx-3">
          {subtext}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;

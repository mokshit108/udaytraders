import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const username = sessionStorage.getItem("username");
  const navigate = useNavigate();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div id="sucess" className="padding max-md:pt-28">
      <div className="border shadow-lg rounded-lg align-middle sm:mt-5 bg-white text-black text-base font-semibold p-10 text-center md:mx-40">
        <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold p-2 text-sky-950 text-center">
          Your Order is Placed
        </h3>
        <h3 className="max-md:text-xl text-2xl font-palanquin font-bold p-2 text-sky-950 text-center">
          Thank you <span className="text-sky-500">{username}</span> for
          Shopping with us !!!
        </h3>
      </div>
    </div>
  );
};

export default SuccessPage;

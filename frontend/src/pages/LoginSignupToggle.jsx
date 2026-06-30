// src/components/LoginSignupToggle.jsx

const LoginSignupToggle = ({ isLogin, setIsLogin }) => {
  return (
    <div className="flex justify-evenly mb-6 bg-sky-100">
      <button
        className={`px-4 py-2 ${
          isLogin
            ? "m-2 border w-[50%] bg-white text-black-500 font-semibold font-montserrat"
            : "w-[50%] font-normal font-montserrat bg-sky-100"
        }`}
        onClick={() => setIsLogin(true)}
      >
        Sign In
      </button>
      <button
        className={`px-4 py-2 ${
          !isLogin
            ? "m-2 border w-[50%] bg-white text-black font-semibold font-montserrat"
            : "w-[50%] font-normal font-montserrat bg-sky-100"
        }`}
        onClick={() => setIsLogin(false)}
      >
        Create Account
      </button>
    </div>
  );
};

export default LoginSignupToggle;

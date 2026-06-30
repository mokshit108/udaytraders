import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-semibold text-black">404</h1>
      <p className="text-3xl mt-4">Page Not Found</p>
      <p className="mt-2 font-palanquin text-sky-950 text-xl">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-4 px-2 py-2 bg-sky-950 hover:bg-sky-700 text-white rounded-sm">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;

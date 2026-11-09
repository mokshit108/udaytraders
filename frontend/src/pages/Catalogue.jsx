import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { PLACEHOLDER_IMG } from "../utils/cloudinaryImage";

const BrandTile = ({ brand }) => (
  <Link
    to={`/brand/${brand.slug}`}
    className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
  >
    <div className="w-full aspect-[4/3] bg-slate-50 overflow-hidden">
      <img
        src={brand.cover_url || PLACEHOLDER_IMG}
        alt={brand.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
      />
    </div>
    <div className="p-3 sm:p-4 text-center">
      <h4 className="font-palanquin font-semibold text-sky-950 text-sm sm:text-base line-clamp-1">{brand.name}</h4>
      <p className="font-montserrat text-xs text-slate-500 mt-1">{brand.product_count} items</p>
    </div>
  </Link>
);

export const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/brands`);
        if (!response.ok) throw new Error("Failed to fetch brands");
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load the catalogue. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return { brands, loading, error };
};

export const BrandTiles = () => {
  const { brands, loading, error } = useBrands();
  const partA = brands.filter((b) => b.part === "A");
  const partB = brands.filter((b) => b.part === "B");

  const grid = (list) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {list.map((brand) => (
        <BrandTile key={brand.id} brand={brand} />
      ))}
    </div>
  );

  return (
    <section className="py-10 px-4 sm:px-6 md:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h3 className="font-palanquin font-bold text-xl sm:text-2xl text-sky-900 mb-4">
          Part A — Brands
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-sky-900" />
          </div>
        ) : error ? (
          <p className="text-red-600 font-montserrat">{error}</p>
        ) : (
          grid(partA)
        )}

        <h3 className="font-palanquin font-bold text-xl sm:text-2xl text-sky-900 mt-10 mb-4">
          Part B — Allied Products
        </h3>
        {!loading && !error && grid(partB)}
      </div>
    </section>
  );
};

const Catalogue = () => {
  const { brands, loading, error } = useBrands();

  const partA = brands.filter((b) => b.part === "A");
  const partB = brands.filter((b) => b.part === "B");

  const grid = (list) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {list.map((brand) => (
        <BrandTile key={brand.id} brand={brand} />
      ))}
    </div>
  );

  return (
    <section className="pt-28 md:pt-32 pb-10 px-4 sm:px-6 md:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-palanquin font-bold text-sky-950 text-center">
          Catalogue
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-montserrat text-center mt-2 mb-8">
          Browse our full price list and catalogue, brand by brand.
        </p>

        {error && <div className="text-red-600 text-center mt-4 font-montserrat">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-sky-900" />
            <span className="ml-2 font-montserrat">Loading catalogue...</span>
          </div>
        ) : (
          <>
            <h3 className="font-palanquin font-bold text-xl sm:text-2xl text-sky-900 mt-6 mb-4">
              Part A — Brands
            </h3>
            {partA.length > 0 ? grid(partA) : <p className="text-slate-500 font-montserrat">No brands found.</p>}

            <h3 className="font-palanquin font-bold text-xl sm:text-2xl text-sky-900 mt-10 mb-4">
              Part B — Allied Products
            </h3>
            {partB.length > 0 ? grid(partB) : <p className="text-slate-500 font-montserrat">No categories found.</p>}
          </>
        )}
      </div>
    </section>
  );
};

export default Catalogue;

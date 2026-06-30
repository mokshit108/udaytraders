import { useCart } from "../context/CartContext";

const PopularProductCard = ({ img_url, name, price, product, stock }) => {
  const { addToCart } = useCart();
  const handleAddToCart = (product) => {
    addToCart(product);
  };
  const isLongName = name.length > 20;
  return (
    <div className="flex flex-1 flex-col w-full max-sm:w-full">
      <img src={img_url} alt={name} className="w-[282px] h-[282px]" />
      <h3
        className={` ${
          isLongName ? "text-xl" : "text-xl"
        } leading-normal font-semibold font-palanquin`}
      >
        {name}
      </h3>
      <p className=" font-semibold font-montserrat text-sky-950 text-xl leading-normal">
      ₹{Math.floor(price)}
      </p>
      {!stock && <p className="text-red-500 font-semibold">Restocking soon</p>}
      <button
        className={` px-4 py-2 bg-sky-950 hover:bg-sky-700 text-white rounded-sm ${
          !product.stock && "opacity-50 cursor-not-allowed"
        }`}
        onClick={() => handleAddToCart(product)}
        disabled={!stock}
      >
        {product.stock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
};

export default PopularProductCard;

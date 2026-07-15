

const PopularProductCard = ({ img_url, name, price, product, stock }) => {
  const isLongName = name.length > 20;
  
  return (
    <div className="flex flex-1 flex-col w-full h-full p-4 sm:p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden mb-4 relative">
        <img 
          src={img_url} 
          alt={name} 
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      <div className="flex flex-col flex-grow justify-between">
        <h3
          className={` ${
            isLongName ? "text-lg md:text-xl" : "text-xl md:text-2xl"
          } leading-snug font-semibold font-palanquin text-slate-800 mb-2 line-clamp-2`}
        >
          {name}
        </h3>
        
        <div className="mt-auto">
          <p className="font-bold font-montserrat text-sky-900 text-lg md:text-xl mb-2">
            ₹{Math.floor(price)}
          </p>
          {!stock ? (
            <div className="w-full text-center bg-red-50 text-red-500 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold">
              Restocking soon
            </div>
          ) : (
            <button className="w-full bg-sky-700 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularProductCard;

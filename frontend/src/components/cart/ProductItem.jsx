
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ProductItem = ({
  isRemoving,
  handleRemoveFromCart,
  handleQuantityChange,
  initialQuantities,
  updatedCartItems,
  cartModified,
  isUpdating,
 
  handleUpdateCart
  
}) => {
 
  return (
    <>


      {/* Desktop View */}
      <div className="">
        <div className="shadow-lg p-6 border rounded-lg border-double bg-white overflow-x-auto mt-4">
          <div className="bg-white">
            {/* Desktop Header */}
            <div className="hidden md:flex flex-row border-b">
              <div className="py-2 px-2 w-2/5 lg:w-2/5 font-montserrat font-medium">
                Product
              </div>
              <div className="py-2 px-2 w-1/5 lg:w-1/5 font-montserrat font-medium">
                Price
              </div>
              <div className="py-2 px-2 w-1/5 lg:w-1/5 font-montserrat font-medium">
                Quantity
              </div>
              <div className="py-2 px-2 w-1/5 lg:w-1/5 font-montserrat font-medium">
                Subtotal
              </div>
            </div>

            {/* Mobile and Desktop Rows */}
            {updatedCartItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row items-center border-b border-gray-200 ${
                  index === updatedCartItems.length - 1 ? "" : "pb-2 pt-2"
                }`}
              >
                <div className="py-2 px-4 w-full md:w-2/5 lg:w-2/5 flex items-center">
                  {isRemoving ? (
                    <div className="loader"></div>
                  ) : (
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="text-black cursor-pointer mr-2"
                        onClick={() => handleRemoveFromCart(item.id)}
                      />
                      <img
                        src={item.img_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />
                      <span>{item.name}</span>
                    </div>
                  )}
                </div>
                <div className="py-2 px-2 w-1/5 lg:w-1/5">
                  ₹{item.price}
                </div>
                <div className="py-2 px-2 w-1/5 lg:w-1/5">
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="py-2 px-2 w-1/5 lg:w-1/5">
                  ₹{item.price * (initialQuantities[item.id] || item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Update Button */}
          <div className="mt-4 flex justify-start">
                    <button
                      onClick={handleUpdateCart}
                      disabled={!cartModified}
                      className={`bg-sky-950 text-white px-4 py-2 rounded-sm hover:bg-sky-700 ${
                        cartModified ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {isUpdating ? "Updating..." : "Update Cart"}
                    </button>
                  </div>

          
        </div>
      </div>
    </>
  );
};

export default ProductItem;

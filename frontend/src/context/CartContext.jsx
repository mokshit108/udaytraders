import { createContext, useContext, useState, useEffect } from "react";

import { handleDownload } from '../utils/downloadUtils';


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const shipping = 50;

  const [cartItems, setCartItems] = useState(() => {
    const storedCartItems = sessionStorage.getItem("cartItems");
    return storedCartItems ? JSON.parse(storedCartItems) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const storedCoupon = sessionStorage.getItem("appliedCoupon");
    return storedCoupon ? storedCoupon : "";
  });

  const [discountPercentage, setDiscountPercentage] = useState(() => {
    const storedDiscount = sessionStorage.getItem("discountPercentage");
    return storedDiscount ? parseInt(storedDiscount) : 0;
  });



  const [orderDetails, setOrderDetails] = useState(() => {
    const savedOrderDetails = sessionStorage.getItem("orderDetails");
    return savedOrderDetails ? JSON.parse(savedOrderDetails) : {};
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };
  const [totalAmount, setTotalAmount] = useState(() => calculateSubtotal() + shipping);
  const [finalAmount, setFinalAmount] = useState(() => {
    const subtotal = calculateSubtotal();
    const discount = ((subtotal + shipping) * discountPercentage) / 100;
    return subtotal + shipping - discount;
  });

  useEffect(() => {
    const subtotal = calculateSubtotal();
    const total = subtotal + shipping;
    const discountedTotal = total - (total * discountPercentage) / 100;

    setTotalAmount(total);
    setFinalAmount(discountedTotal);

    // Update session storage
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    if (cartItems.length === 0) {
      setAppliedCoupon("");
      setDiscountPercentage(0);
      sessionStorage.removeItem("appliedCoupon");
      sessionStorage.removeItem("discountPercentage");
      sessionStorage.removeItem("orderDetails");
    }
    if (appliedCoupon) {
      sessionStorage.setItem("appliedCoupon", appliedCoupon);
      sessionStorage.setItem("discountPercentage", discountPercentage);
    }
  }, [cartItems, appliedCoupon, discountPercentage, orderDetails]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };



  const saveOrderDetails = (details) => {
    setOrderDetails(details);
  };

  const downloadData = (data, filename) => {
    handleDownload(data, filename);
  };

  const validateExcelFile = (file) => {
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      // Add this line to handle cases where Excel files are detected differently
      'application/octet-stream'
    ];
    
    // Extract file extension
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['xlsx', 'xls', 'csv'];
    
    if (!validExtensions.includes(fileExtension) && !validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.');
    }
  
    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }
  
    return true;
  };

  const importExcelData = async (file,tableName, onSuccess, onError) => {
    try {
      if (!tableName) {
        throw new Error("Table name is required.");
      }

      const formData = new FormData();
      formData.append('file', file);
  
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/import/data/${tableName}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && responseData.errors) {
          const errorMessage = responseData.errors.map(err => 
            `Row ${err.row}: ${err.error}`
          ).join('\n');
          throw new Error(errorMessage);
        }
        throw new Error(responseData.message || 'Failed to import users');
      }
  
      onSuccess?.(responseData);
      return responseData;
    } catch (error) {
      console.error('Error importing Excel:', error);
      onError?.(error.message);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemQuantity,
        appliedCoupon,
        setAppliedCoupon,
        discountPercentage,
        setDiscountPercentage,
        orderDetails,
        saveOrderDetails,
        finalAmount,       // Discounted total
        totalAmount, // Total without discount
        downloadData,
        importExcelData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};

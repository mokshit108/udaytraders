import React from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa'; // Using react-icons for simplicity

const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "red", borderRadius: "50%", width: "40px", height: "40px" }}
      onClick={onClick}
    >
      <FaArrowRight size={20} color="white" /> {/* Customize icon */}
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "green", borderRadius: "50%", width: "40px", height: "40px" }}
      onClick={onClick}
    >
      <FaArrowLeft size={20} color="white" /> {/* Customize icon */}
    </div>
  );
};

export { SampleNextArrow, SamplePrevArrow };

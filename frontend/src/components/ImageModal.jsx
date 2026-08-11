import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ImageModal = ({ images, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen || !images || images.length === 0) return null;

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition"
                >
                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>

                <div className="flex-1 relative flex items-center justify-center bg-gray-50 min-h-0">
                    {images.length > 1 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 z-10 bg-white/80 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                        </button>
                    )}

                    <img
                        src={images[currentIndex]}
                        alt={`Product view ${currentIndex + 1}`}
                        className="w-full h-full object-contain p-4 max-h-[70vh]"
                    />

                    {images.length > 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-4 z-10 bg-white/80 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
                        </button>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="bg-white p-4 border-t border-gray-100 flex gap-3 overflow-x-auto justify-center">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === idx ? 'border-sky-600 shadow-md transform scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                onClick={() => setCurrentIndex(idx)}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal;

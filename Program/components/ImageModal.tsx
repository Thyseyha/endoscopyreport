
import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose} // Close on overlay click
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 p-2 sm:p-4 rounded-lg shadow-xl max-w-full max-h-full overflow-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button
          onClick={onClose}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full p-0.5 sm:p-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label="Close image viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          className="max-w-full max-h-[90vh] sm:max-h-[90vh] object-contain rounded" 
        />
      </div>
    </div>
  );
};

export default ImageModal;

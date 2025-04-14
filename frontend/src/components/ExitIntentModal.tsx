'use client';

import { useEffect } from 'react';
import EmailSubscriptionForm from './EmailSubscriptionForm'; // Assuming it's in the same directory

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExitIntentModal({ isOpen, onClose }: ExitIntentModalProps) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    // Cleanup listener on component unmount or when isOpen changes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose} // Close when clicking the backdrop
    >
      <div
        className="relative bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl leading-none font-semibold"
          aria-label="Close modal"
        >
          &times; {/* Unicode multiplication sign */}
        </button>

        {/* Content - Embed the Subscription Form */}
        <EmailSubscriptionForm />
      </div>
    </div>
  );
} 
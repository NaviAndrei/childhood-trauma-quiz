'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiShare2, FiLink, FiTwitter, FiFacebook, FiCheck } from 'react-icons/fi'; // Using react-icons for icons

export default function ShareComponent() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + pathname : '';
  const shareTitle = "My Childhood Trauma Quiz Results"; // Customize as needed
  const shareText = "I took a quiz to understand my early experiences. See the quiz here:"; // Customize as needed

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback if navigator.share is not supported (though button might be hidden)
      alert('Web Share API is not supported in your browser. Please use other options.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy link.');
    });
  };

  // Basic social share URLs (encode components)
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  // Note: WhatsApp requires specific formats and might not prefill text on desktop
  // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-center text-gray-600 mb-3 font-medium">Share Your Results</p>
      <div className="flex justify-center items-center space-x-3">
        {typeof navigator !== 'undefined' && navigator.share !== undefined && (
          <button
            type="button"
            onClick={handleNativeShare}
            title="Share using device options"
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-150 ease-in-out"
          >
            <FiShare2 size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy link"
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-150 ease-in-out relative"
        >
          {copied ? <FiCheck size={20} className="text-green-600" /> : <FiLink size={20} />}
        </button>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Twitter"
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-150 ease-in-out block"
        >
          <FiTwitter size={20} />
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Facebook"
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-150 ease-in-out block"
        >
          <FiFacebook size={20} />
        </a>
        {/* Add more share options like WhatsApp, LinkedIn etc. if needed */}
      </div>
    </div>
  );
} 
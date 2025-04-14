'use client';

import { useState } from 'react';
import { FaShareAlt, FaCopy, FaCheck } from 'react-icons/fa'; // Using react-icons for common icons

interface ShareButtonsProps {
  title: string; // Quiz title
  text: string; // Text to share (e.g., "I took the quiz...")
  url?: string; // URL to share (defaults to window.location.href)
}

export default function ShareButtons({ title, text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: shareUrl,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy link if native share fails or is cancelled
        handleCopyLink();
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopyLink();
      alert('Sharing not supported on this browser. Link copied to clipboard!');
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
      }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link.');
      });
    } else {
        // Basic fallback for older browsers (less common now)
        try {
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            alert('Failed to copy link.');
        }
    }
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <p className="text-sm font-semibold mr-2 hidden sm:block">Share:</p>
        {/* Native Share / Fallback Button */} 
        <button
            onClick={handleNativeShare}
            title={navigator.share ? "Share via system dialog" : "Copy link to share"}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow"
        >
            <FaShareAlt className="mr-2" />
            {navigator.share ? 'Share Result' : 'Share Link'} 
        </button>

        {/* Explicit Copy Link Button */} 
        <button
            onClick={handleCopyLink}
            title="Copy link to clipboard"
            className="flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors shadow"
        >
            {copied ? <FaCheck className="mr-2 text-green-400" /> : <FaCopy className="mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
        </button>
         {/* Optional: Direct share links (Example for Twitter) */}
         {/* 
         <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-[#1DA1F2] hover:bg-[#0c85d0] text-white rounded-md transition-colors shadow"
         >
             <FaTwitter className="mr-2" /> Tweet
         </a> 
         */}
    </div>
  );
} 
'use client'; // Make it a client component for state management

import Link from 'next/link';
import { useBackground } from '@/context/BackgroundContext'; // Import the custom hook

export default function Home() {
  // Use state and functions from context
  const { bgIndex, setBgIndex, backgroundClasses } = useBackground();

  const changeBackground = () => {
    setBgIndex((prevIndex) => (prevIndex + 1) % backgroundClasses.length);
  };

  return (
    // Restore dynamic background class from context
    <main className={`relative flex min-h-screen flex-col items-center justify-center p-6 md:p-24 transition-colors duration-500 ${backgroundClasses[bgIndex]}`}>
      <div className="text-center max-w-2xl flex flex-col items-center"> {/* Added flex for button centering */}
        {/* Updated Heading */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          What&apos;s Your Hidden Trauma Type? (Free 5-Min Test)
        </h1>
        {/* Added Subheading */}
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          92% of users are shocked by their results. Are you next?
        </p>
        {/* Updated Button */}
        <Link
          href="/quiz/childhood-trauma-score"
          className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition-colors mb-6"
        >
          Start Now – It&apos;s Free
        </Link>

        {/* Container for inline text and button */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {/* Text label for the button */}
          <span className="text-sm text-gray-600">Change background color</span>

          {/* Background Changer Button - Updated Colors */}
          <button
              onClick={changeBackground}
              // Changed background to blue, icon/text to white
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow transition"
              aria-label="Change background color"
          >
              {/* Simple icon placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
          </button>
        </div>

        {/* Added Privacy Assurance */}
        <p className="text-sm text-gray-600 mb-12">
          Your answers are anonymous. We never share your data.
        </p>
      </div>
    </main>
  );
}

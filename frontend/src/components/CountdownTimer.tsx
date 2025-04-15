'use client'; // Assuming it might need client-side logic later

import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline'; // Using outline variant

const MIN_HOURS = 2;
const MAX_HOURS = 6;
const MIN_SECONDS = MIN_HOURS * 3600;
const MAX_SECONDS = MAX_HOURS * 3600;

// Helper to get a new random duration in seconds
const getRandomDuration = (): number => {
  return Math.floor(Math.random() * (MAX_SECONDS - MIN_SECONDS + 1)) + MIN_SECONDS;
};

// Helper to format time as HH:MM:SS
const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "00:00:01"; // Fallback to reset trigger

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function CountdownTimer() {
  // Initialize state with a random duration
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState<number>(getRandomDuration());

  useEffect(() => {
    // Set initial random time again on mount to ensure client-side execution
    setTotalSecondsRemaining(getRandomDuration());

    const intervalId = setInterval(() => {
      setTotalSecondsRemaining(prevSeconds => {
        // If timer is close to zero (e.g., under 1 minute), reset to a new random duration
        if (prevSeconds <= 1) {
          return getRandomDuration();
        }
        // Otherwise, just decrement
        return prevSeconds - 1;
      });
    }, 1000); 

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); 

  return (
    // Apply Tailwind classes for styling: red text, monospace font, flex alignment for icon
    <span className="inline-flex items-center text-red-600 font-mono" aria-live="polite" aria-label={`Discount expires in: ${formatTime(totalSecondsRemaining)}`}>
      <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
      {formatTime(totalSecondsRemaining)}
    </span>
  );
}
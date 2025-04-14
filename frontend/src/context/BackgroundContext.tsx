'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface BackgroundContextType {
  bgIndex: number;
  setBgIndex: React.Dispatch<React.SetStateAction<number>>;
  backgroundClasses: string[]; // Keep the classes definition here for easy access
}

// Define the background gradient classes - Updated with more saturated colors
const backgroundClasses = [
  'bg-white', // Keep white as the default
  'bg-gradient-to-br from-green-300 to-teal-300', // Increased saturation
  'bg-gradient-to-br from-blue-300 to-purple-300', // Increased saturation
  'bg-gradient-to-br from-pink-300 to-orange-300', // Increased saturation
  'bg-gradient-to-br from-yellow-300 to-red-300',   // Increased saturation
];

// Create the context with a default value (can be undefined or null, but needs type assertion)
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Create a Provider component
export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [bgIndex, setBgIndex] = useState(0); // Default background is white (index 0)

  return (
    <BackgroundContext.Provider value={{ bgIndex, setBgIndex, backgroundClasses }}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Create a custom hook to use the BackgroundContext
export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}; 
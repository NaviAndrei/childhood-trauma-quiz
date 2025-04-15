import type { Metadata } from 'next'; // Import Metadata type
import LandingPageContent from '@/components/LandingPageContent'; // Import the new client component

// Add specific metadata for the landing page
export const metadata: Metadata = {
  title: 'Childhood Trauma Quiz - Understand Your Past Experiences', // Specific title
  description: 'Take the anonymous Childhood Trauma Questionnaire (CTQ-SF) to gain insights into how early experiences might affect you today. Learn more and find resources.',
  // Add Open Graph and Twitter Card metadata for better sharing
  openGraph: {
    title: 'Childhood Trauma Quiz - Understand Your Past Experiences',
    description: 'Gain insights into how early experiences might affect you with the validated CTQ-SF quiz.',
    url: 'https://www.ihatethisquiz.com', // Production domain
    siteName: 'Trauma Quiz', // Site name
    images: [
      {
        url: 'https://www.ihatethisquiz.com/og-image.png', // Replace with actual OG image when available
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Childhood Trauma Quiz - Understand Your Past Experiences',
    description: 'Gain insights into how early experiences might affect you with the validated CTQ-SF quiz.',
    // siteId: 'YourTwitterHandleID', // Optional: Your Twitter handle ID
    // creator: '@YourTwitterHandle', // Optional: Your Twitter handle
    // creatorId: 'YourTwitterHandleID', // Optional
    // images: ['https://your-production-domain.com/twitter-image.png'], // Replace with URL to a relevant Twitter image
  },
};

// This is now a Server Component
export default function Home() {
  return (
    <LandingPageContent /> // Render the client component that holds the actual page UI and logic
  );
}

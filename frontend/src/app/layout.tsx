import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackgroundProvider } from "@/context/BackgroundContext";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Childhood Trauma Quiz",
  description: "Understand your experiences with the Childhood Trauma Questionnaire (CTQ-SF)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <BackgroundProvider>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 md:px-12 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold text-teal-600 dark:text-teal-400">
                Trauma Quiz
              </Link>
            </div>
          </header>
          
          <div className="flex-grow">
            {children}
          </div>

          {/* Footer */}
          <footer className="bg-gray-100 dark:bg-gray-900 py-4 mt-auto">
            <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Trauma Quiz. All rights reserved. | Designed by <Link href="https://syncwithivan.com" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">Ivan Andrei</Link>
            </div>
          </footer>
        </body>
      </BackgroundProvider>
    </html>
  );
}

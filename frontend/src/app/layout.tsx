import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackgroundProvider } from "@/context/BackgroundContext";

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
        <body className={inter.className}>{children}</body>
      </BackgroundProvider>
    </html>
  );
}

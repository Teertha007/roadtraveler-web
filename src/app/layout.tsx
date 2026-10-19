import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "RoadTraveler",
  description: "USA-focused roadside & camping discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased dark`}>
      <body className="min-h-full flex text-white bg-background">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

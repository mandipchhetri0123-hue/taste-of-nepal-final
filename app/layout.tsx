import React from "react";
import "./globals.css";

export const metadata = {
  title: "Taste of Nepal",
  description: "Browse and order Nepali food online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">{children}</body>
    </html>
  );
}


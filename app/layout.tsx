import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taste of Nepal",
  description: "Discover authentic Nepali restaurants and order your favorite dishes online.",
  manifest: "/manifest.json",
  themeColor: "#d32f2f",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">{children}</body>
    </html>
  );
}

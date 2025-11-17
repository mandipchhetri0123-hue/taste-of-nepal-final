// app/layout.tsx
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Taste of Nepal',
  description: 'Authentic Nepali catering and online ordering',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="container mx-auto py-8 px-4">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

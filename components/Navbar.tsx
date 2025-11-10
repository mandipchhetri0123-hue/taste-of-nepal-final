import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Taste of Nepal Logo" width={64} height={64} />
          <span className="text-xl font-bold text-nepal-red">Taste of Nepal</span>
        </Link>

        <nav className="flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:text-nepal-red">Home</Link>
          <Link href="/menu" className="hover:text-nepal-red">Menu</Link>
          <Link href="/about" className="hover:text-nepal-red">About</Link>
          <Link href="/contact" className="hover:text-nepal-red">Contact</Link>
          <Link href="/login" className="hover:text-nepal-red">Login</Link>
          <Link href="/cart" className="hover:text-nepal-red flex items-center">
            <i className="fas fa-shopping-cart mr-1" /> Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}

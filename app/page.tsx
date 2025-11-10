import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero with background image + logo */}
      <section className="relative h-[60vh] md:h-[80vh] bg-cover bg-center" style={{ backgroundImage: "url('/banner.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col items-center justify-center p-4">
          <Image src="/logo.png" alt="Taste of Nepal Logo" width={300} height={300} className="mb-6 h-auto w-auto" />
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white text-center mb-4 leading-tight">
            Authentic Flavours from the Himalayas
          </h1>
          <Link
            href="/menu"
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            View Our Menu
          </Link>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-heading font-bold text-center section-heading-divider mx-auto mb-12 w-fit">
          Our Popular Dishes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img src="https://placehold.co/600x400/FEE2E2/DC2626?text=Steamed+Momo" alt="Nepalese Momo" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">Steamed Momo</h3>
              <p className="text-gray-600 mb-4">Delicious dumplings filled with seasoned mince, served with a tangy tomato chutney.</p>
              <Link href="/menu" className="text-nepal-blue hover:underline">See more →</Link>
            </div>
          </div>
          {/* 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img src="https://placehold.co/600x400/E0F2FE/2563EB?text=Chicken+Choila" alt="Chicken Choila" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">Chicken Choila</h3>
              <p className="text-gray-600 mb-4">Grilled boneless chicken with spices.</p>
              <Link href="/menu" className="text-nepal-blue hover:underline">See more →</Link>
            </div>
          </div>
          {/* 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img src="https://placehold.co/600x400/EDE9FE/7C3AED?text=Pakoda" alt="Pakoda" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">Pakoda (Veg)</h3>
              <p className="text-gray-600 mb-4">Deep-fried vegetable fritter.</p>
              <Link href="/menu" className="text-nepal-blue hover:underline">See more →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

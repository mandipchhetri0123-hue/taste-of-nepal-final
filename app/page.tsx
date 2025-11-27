import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section
        className="relative h-[65vh] md:h-[85vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
          <Image
            src="/logo.png"
            alt="Taste of Nepal Logo"
            width={260}
            height={260}
            className="mb-4 h-auto w-auto drop-shadow-xl"
          />

          {/* MAIN CATERING MESSAGE */}
          <h1 className="font-heading text-4xl md:text-6xl text-white font-extrabold mb-4 leading-tight">
            Nepalese Catering Service for Your Events
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mb-8">
            Authentic Himalayan flavours delivered to your home, parties,
            birthdays, weddings and corporate events all across Sydney.
          </p>

        </div>
      </section>

      

      {/* POPULAR DISHES */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-heading font-bold text-center mb-12">
          Popular Items From Our Catering Menu
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://www.thespruceeats.com/thmb/T_R22QniykdQ9aPCLKIk-O22Gh4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/steamed-momos-wontons-1957616-hero-01-1c59e22bad0347daa8f0dfe12894bc3c.jpg"
              alt="Nepalese Momo"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">
                Steamed Momo
              </h3>
              <p className="text-gray-600 mb-4">
                Soft dumplings served with homemade spicy chutney.
              </p>
              <Link href="/menu" className="text-nepal-blue hover:underline">
                See more →
              </Link>
            </div>
          </div>

          {/* 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://junifoods.com/wp-content/uploads/2023/04/easy-chicken-choila-1024x693.png"
              alt="Chicken Choila"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">
                Chicken Choila
              </h3>
              <p className="text-gray-600 mb-4">
                Grilled chicken tossed in authentic Nepali spices.
              </p>
              <Link href="/menu" className="text-nepal-blue hover:underline">
                See more →
              </Link>
            </div>
          </div>

          {/* 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://www.indianveggiedelight.com/wp-content/uploads/2022/04/air-fryer-onion-pakoda-2.jpg"
              alt="Pakoda"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-nepal-red">
                Veg Pakoda
              </h3>
              <p className="text-gray-600 mb-4">
                Crispy vegetable fritters perfect for party starters.
              </p>
              <Link href="/menu" className="text-nepal-blue hover:underline">
                See more →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

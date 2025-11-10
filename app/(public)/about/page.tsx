export default function AboutPage() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src="/dalbhat.jpg" alt="Authentic Nepali Dal Bhat Thali" className="rounded-lg shadow-xl w-full" />
        </div>
        <div>
          <h1 className="text-5xl font-heading font-bold mb-6 section-heading-divider">About Taste of Nepal</h1>
          <p className="text-lg text-gray-700 mb-4">
            Welcome! We are a passionate team dedicated to bringing the authentic, rich, and diverse flavors of Nepal to
            the heart of Hurstville, Sydney. Our journey began with a simple mission: to share the warmth of Nepalese
            hospitality and our cherished family recipes with our community.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            We specialize in catering for all occasions – from intimate family gatherings to large corporate events.
            Every dish is prepared with the freshest local ingredients and a blend of traditional Himalayan spices,
            ensuring a truly memorable culinary experience.
          </p>

          <h2 className="text-3xl font-heading font-bold mb-3 text-nepal-blue">Our Story</h2>
          <p className="text-lg text-gray-700 mb-4">
            "Taste of Nepal" is a name that resonates with every hungry Nepalese. We were launched to reach the Nepalese
            community in Sydney and fulfill the needs of authentic Nepali Catering Service in Australia. With the
            growing number of Nepalese in Sydney, there has been an increase in the number of caterers as well. We are a
            team of Nepalese caterers serving Nepali households for events like baby showers, marriage ceremonies, and
            birthday parties.
          </p>

          <h2 className="text-3xl font-heading font-bold mb-3 text-nepal-blue">
            Why Taste of Nepal for catering service in Australia?
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Taste of Nepal team has explored food from different caterers in Sydney and found the food was missing the
            taste and consistency. We believe that consistency is the key to serving significant events.
          </p>
          <p className="text-lg text-gray-700">
            At the very top list of your priorities while you select a catering service should be the quality of food so
            that it does not hamper the event you are planning. Outlooking the needs of Nepali people and their needs of
            catering services, Taste of Nepal is working to provide high-quality food with no room for compromise. Also,
            the cost of service at Taste of Nepal is optimal.
          </p>
        </div>
      </div>
    </section>
  );
}

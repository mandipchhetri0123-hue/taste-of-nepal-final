export default function ContactPage() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-heading font-bold mb-6">Contact</h1>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3 text-gray-700">
          <p><i className="fas fa-map-marker-alt mr-2 text-red-500" /> Hurstville, NSW 2220</p>
          <p><i className="fas fa-phone mr-2 text-red-500" /> 0478 369 119</p>
          <p><i className="fas fa-phone mr-2 text-red-500" /> 0414 543 436</p>
          <p><i className="fas fa-envelope mr-2 text-red-500" /> orders@tasteofnepal.com.au</p>
        </div>
        <form className="space-y-4 bg-white p-6 rounded-lg shadow">
          <input className="w-full border p-3 rounded" placeholder="Name" />
          <input className="w-full border p-3 rounded" placeholder="Email" type="email" />
          <textarea className="w-full border p-3 rounded" placeholder="Message" rows={5} />
          <button className="bg-nepal-red text-white px-6 py-3 rounded font-semibold">Send</button>
        </form>
      </div>
    </section>
  );
}

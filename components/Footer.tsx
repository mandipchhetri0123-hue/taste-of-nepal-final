export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-2xl font-bold font-heading text-white mb-4">Taste of Nepal</h4>
            <p className="text-gray-400">Bringing authentic Nepalese cuisine to Sydney. Perfect for your parties, events, and gatherings.</p>
            <div className="flex space-x-4 mt-4 text-2xl">
              <a href="https://www.facebook.com/tasteofnepalau" target="_blank" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="https://www.instagram.com/tasteofnepalau" target="_blank" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
              <li><a href="/menu" className="hover:text-white transition-colors duration-200">Menu</a></li>
              <li><a href="/about" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li><i className="fas fa-map-marker-alt mr-2 text-red-500" /> 600 Railway Parade Hurstville NSW 2220</li>
              <li><i className="fas fa-phone mr-2 text-red-500" /> 0405 639 995</li>
              <li><i className="fas fa-envelope mr-2 text-red-500" /> support@urkafeniof.resend.app</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>© 2025 Taste of Nepal. All Rights Reserved.</p>
          <p className="text-sm">Bringing the authentic taste of the Himalayas to Sydney.</p>
        </div>
      </div>
    </footer>
  );
}

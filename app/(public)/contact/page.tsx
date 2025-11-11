'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('⚠️ Please fill out all required fields.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
      alert('✅ Your message has been sent successfully!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-nepal-red">Get In Touch</h1>

      {/* --- Contact Form --- */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Your Name (required)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Your Email (required)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter subject"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Type your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-full transition"
            >
              {submitted ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* --- Contact Info + Map --- */}
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Location & Contact Info</h2>
            <p className="text-gray-700 mb-3">
              <strong>Address:</strong><br />
              123 Nepal Street<br />
              Hurstville, NSW 2220, Australia
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Phone:</strong><br />
              0478 369 119<br />
              0414 543 436
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Email:</strong><br />
              <a href="mailto:orders@tasteofnepal.com.au" className="text-red-600 hover:underline">
                orders@tasteofnepal.com.au
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Opening Hours:</strong><br />
              Monday - Sunday: 11:00 AM - 9:00 PM
            </p>
          </div>

          {/* Google Map Embed */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Taste of Nepal Location"
              width="100%"
              height="300"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.423971317967!2d151.098!3d-33.967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b99a2a8d1d2b%3A0x3f9e2d3a1d9cda13!2sHurstville%20NSW%202220!5e0!3m2!1sen!2sau!4v1690022389527!5m2!1sen!2sau"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

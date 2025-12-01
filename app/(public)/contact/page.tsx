"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s]{2,40}$/;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Name validation
    if (!nameRegex.test(formData.name.trim())) {
      alert("⚠️ Enter a valid name (letters only, no numbers).");
      return;
    }

    // Email validation
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      alert("⚠️ Enter a valid email address (e.g. user@example.com).");
      return;
    }

    // Message required
    if (!formData.message.trim()) {
      alert("⚠️ Please enter your message.");
      return;
    }

    try {
      setSubmitted(true);

      // Save message in Firestore
      await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "No subject",
        message: formData.message,
        createdAt: serverTimestamp(),
        status: "unread", // useful for admin message panel
      });

      alert("✅ Your message has been sent successfully!");

      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
      alert("❌ Failed to send message. Please try again later.");
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-nepal-red">
        Get In Touch
      </h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        {/* CONTACT FORM */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-1">
                Your Name (required)
              </label>
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

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-1">
                Your Email (required)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Enter your email (e.g. user@example.com)"
              />
            </div>

            {/* Subject */}
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

            {/* Message */}
            <div>
              <label className="block text-gray-700 mb-1">
                Your Message
              </label>
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
              {submitted ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* CONTACT INFO & MAP */}
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Our Location & Contact Info
            </h2>

            <p className="text-gray-700 mb-3">
              <strong>Address:</strong><br />
              600 Railway Parade<br />
              Hurstville, NSW 2220, Australia
            </p>

            <p className="text-gray-700 mb-3">
              <strong>Phone:</strong><br />
              0405 639 995
            </p>

            <p className="text-gray-700 mb-3">
              <strong>Email:</strong><br />
              <a href="mailto:orders@tasteofnepal.com.au"
                className="text-red-600 hover:underline">
                support@urkafeniof.resend.app
              </a>
            </p>

            <p className="text-gray-700">
              <strong>Opening Hours:</strong><br />
              Monday - Sunday: 11:00 AM - 9:00 PM
            </p>
          </div>

         {/* GOOGLE MAP + VIEW IN LARGE MAP */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Taste of Nepal Location"
              width="100%"
              height="300"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.409019910068!2d151.10085!3d-33.96672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b99a7fc1a9c3%3A0x5f5163afab674a7d!2s600%20Railway%20Pde%2C%20Hurstville%20NSW%202220!5e0!3m2!1sen!2sau!4v1701260000000!5m2!1sen!2sau"

            ></iframe>

           {/* View Large Map Button */}
           <a
             href="https://www.google.com/maps/search/?api=1&query=600+Railway+Parade,+Hurstville+NSW+2220,+Australia"
             target="_blank"
             rel="noopener noreferrer"
             className="block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-0"
            >
             View in Large Map
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}

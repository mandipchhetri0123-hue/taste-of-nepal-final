'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    payment: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.payment) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Simulate payment processing delay
    setTimeout(() => {
      alert('✅ Payment simulated successfully!\nThank you for your order.');
      router.push('/'); // redirect to homepage
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="e.g. 0478 123 456"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Delivery Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter delivery address"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Payment Method</label>
            <select
              name="payment"
              value={form.payment}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Payment Type...</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Card (Simulated)">Card (Simulated)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

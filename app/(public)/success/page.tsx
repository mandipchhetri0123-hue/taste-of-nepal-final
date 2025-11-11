export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-4xl font-bold text-green-700 mb-4">🎉 Order Confirmed!</h1>
      <p className="text-gray-700 text-lg mb-6">
        Your simulated payment was successful. Thank you for your order!
      </p>
      <a
        href="/menu"
        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
      >
        Back to Menu
      </a>
    </div>
  );
}


'use client';
import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const auth = getAuth(app);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e: any) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset link sent to your email.');
    } catch (err: any) {
      setMessage('❌ Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 w-full rounded"/>
          <button className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded">Send Reset Link</button>
        </form>
        {message && <p className="text-center mt-4">{message}</p>}
        <p className="text-center mt-4 text-gray-600">
          <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

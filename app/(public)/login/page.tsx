'use client';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-heading text-center text-nepal-red mb-6">Welcome Back</h1>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-nepal-red text-white py-3 rounded font-semibold hover:bg-red-700 transition">Login</button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <Link href="/register" className="text-nepal-blue hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}


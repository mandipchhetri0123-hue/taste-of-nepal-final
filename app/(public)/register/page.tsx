'use client';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import Link from 'next/link';

export default function RegisterPage() {
  const auth = getAuth(app);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', gender: '',
    dob: '', password: '', confirmPassword: '', bank: '', agree: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword)
      return setError("Passwords don't match");
    if (!form.agree)
      return setError('You must agree to the terms.');

    try {
      setLoading(true);

      // ✅ Create the user
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // ✅ Update Firebase Auth profile with display name (first name)
      await updateProfile(userCred.user, { displayName: form.firstName });

      // ✅ Save user details in Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        gender: form.gender,
        dob: form.dob,
        bank: form.bank,
      });

      alert('✅ Account created successfully!');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">Create Account</h1>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" placeholder="First Name" onChange={handleChange} required className="border p-2 rounded" />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="border p-2 rounded" />
          </div>

          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="border p-2 w-full rounded" />

          <select name="gender" onChange={handleChange} required className="border p-2 w-full rounded">
            <option value="">Gender (Select...)</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input name="dob" type="date" placeholder="Date of Birth" onChange={handleChange} required className="border p-2 w-full rounded" />

          <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="border p-2 w-full rounded" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="border p-2 w-full rounded" />

          <div>
            <p className="text-sm text-gray-600 mb-1">
              For Your Project Assessor (Simulation Only)
            </p>
            <input name="bank" placeholder="Bank Details (BSB & Account)" onChange={handleChange} className="border p-2 w-full rounded" />
          </div>

          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" name="agree" onChange={handleChange} /> 
            <span>I agree to the Terms and Conditions</span>
          </label>

          <button disabled={loading} className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already a member? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

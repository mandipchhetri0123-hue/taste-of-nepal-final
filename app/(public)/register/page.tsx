"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+[1-9]\d{7,14}$/;
const strongPassword =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;

export default function RegisterPage() {
  const auth = getAuth(app);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // VALIDATION
    if (!form.firstName.trim() || !form.lastName.trim())
      return setError("Please enter your first and last name.");

    if (!emailRegex.test(form.email.trim()))
      return setError("Please enter a valid email address.");

    if (!phoneRegex.test(form.phone.trim()))
      return setError("Please enter a valid phone number (+614...).");

    if (!form.gender) return setError("Please select your gender.");
    if (!form.dob) return setError("Please select your date of birth.");

    if (!strongPassword.test(form.password))
      return setError(
        "Password must have 1 uppercase, 1 number, 1 symbol, and be at least 8 characters."
      );

    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");

    if (!form.agree)
      return setError("You must agree to the Terms & Conditions.");

    // ============================
    // CREATE USER WITH EMAIL VERIFY
    // ============================
    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const user = userCred.user;

      // Send professional email verification
      await sendEmailVerification(user, {
  url: "https://tasteofnepal.xyz/verify-email",
  handleCodeInApp: true,
});


      // Save TEMP user to pendingUsers until verification
      await setDoc(doc(db, "pendingUsers", user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        dob: form.dob,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      setMessage(
        "A verification email has been sent. Please open your inbox and confirm to activate your account."
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-4 text-center">Create Account</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        <form onSubmit={handleRegister} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              className="border p-2 rounded"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            className="border p-2 rounded w-full"
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded w-full"
            name="phone"
            placeholder="Phone (+614...)"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />

          <select
            name="gender"
            className="border p-2 rounded w-full"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <div>
            <label className="text-sm text-gray-600">
              Insert your date of birth:
            </label>
            <input
              className="border p-2 rounded w-full mt-1"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          <input
            className="border p-2 rounded w-full"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded w-full"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            I agree to Terms & Conditions
          </label>

          <button
            className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already a member?{" "}
          <Link href="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

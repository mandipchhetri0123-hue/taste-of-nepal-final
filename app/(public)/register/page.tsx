"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164 phone format
const phoneRegex = /^\+[1-9]\d{7,14}$/;

// Strong password regex: 1 uppercase, 1 number, 1 symbol, min 8 chars
const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setError("Please enter your first and last name.");
    }

    if (!emailRegex.test(form.email.trim())) {
      return setError("Please enter a valid email address.");
    }

    if (!phoneRegex.test(form.phone.trim())) {
      return setError("Please enter a valid phone number (e.g. +61412345678).");
    }

    if (!form.gender) {
      return setError("Please select your gender.");
    }

    if (!form.dob) {
      return setError("Please insert your date of birth.");
    }

    if (!strongPassword.test(form.password)) {
      return setError(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 symbol."
      );
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!form.agree) {
      return setError("You must agree to the Terms & Conditions.");
    }

    // ---------------------------
    // CREATE USER
    // ---------------------------
    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        dob: form.dob,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      alert("✅ Account created!");
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Create Account</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              className="border p-2 rounded"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <input
            className="border p-2 rounded w-full"
            name="email"
            placeholder="Email (e.g. user@example.com)"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Phone Number */}
          <input
            className="border p-2 rounded w-full"
            name="phone"
            placeholder="Phone (e.g. +61412345678)"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/* Gender */}
          <select
            name="gender"
            className="border p-2 rounded w-full"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {/* DOB */}
          <div>
            <label className="text-sm text-gray-600">Insert your date of birth:</label>
            <input
              className="border p-2 rounded w-full mt-1"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <input
            className="border p-2 rounded w-full"
            name="password"
            type="password"
            placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 symbol)"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Confirm Password */}
          <input
            className="border p-2 rounded w-full"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* Terms */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            I agree to Terms & Conditions
          </label>

          {/* Submit */}
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

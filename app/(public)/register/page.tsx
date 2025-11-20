"use client";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import Link from "next/link";

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
    bank: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword)
      return setError("Passwords don't match");

    if (!form.agree)
      return setError("You must agree to Terms & Conditions");

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        bankDetails: form.bank,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      alert("Account created!");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Create Account
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
            />
            <input
              className="border p-2 rounded"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <input
            className="border p-2 rounded w-full"
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleChange}
          />

          {/* Phone Number */}
          <input
            className="border p-2 rounded w-full"
            name="phone"
            placeholder="Phone Number"
            type="text"
            onChange={handleChange}
          />

          {/* Gender */}
          <select
            name="gender"
            className="border p-2 rounded w-full"
            onChange={handleChange}
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {/* DOB */}
          <input
            className="border p-2 rounded w-full"
            name="dob"
            type="date"
            onChange={handleChange}
          />

          {/* Password */}
          <input
            className="border p-2 rounded w-full"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded w-full"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          {/* Bank */}
          <input
            className="border p-2 rounded w-full"
            name="bank"
            placeholder="Bank Details (simulation only)"
            onChange={handleChange}
          />

          {/* Terms */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="agree" onChange={handleChange} /> I
            agree to Terms & Conditions
          </label>

          <button className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700">
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

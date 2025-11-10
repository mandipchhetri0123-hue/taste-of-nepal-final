"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function AuthGate() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user) {
    return (
      <div className="card space-y-3">
        <div>Signed in as <b>{user.email}</b></div>
        <button className="btn" onClick={() => signOut(auth)}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <input className="rounded border-gray-300" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="rounded border-gray-300" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <div className="flex gap-2">
        <button className="btn" onClick={() => signInWithEmailAndPassword(auth, email, pw)}>Login</button>
        <button className="btn" onClick={() => createUserWithEmailAndPassword(auth, email, pw)}>Register</button>
      </div>
    </div>
  );
}

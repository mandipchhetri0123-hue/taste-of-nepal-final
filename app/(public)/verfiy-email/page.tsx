"use client";

import { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const auth = getAuth(app);
  const router = useRouter();

  const [status, setStatus] = useState("Verifying your email…");

  useEffect(() => {
    const url = new URL(window.location.href);
    const oobCode = url.searchParams.get("oobCode");

    if (!oobCode) {
      setStatus("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);

        // GET LOGGED-IN USER
        const user = auth.currentUser;
        if (!user) {
          setStatus("Email verified! Please login.");
          return;
        }

        // FETCH pendingUsers/{uid}
        const pendingRef = doc(db, "pendingUsers", user.uid);
        const snapshot = await getDoc(pendingRef);

        if (!snapshot.exists()) {
          setStatus("Verification successful! You may now login.");
          return;
        }

        const userData = snapshot.data();

        // MOVE TO users/{uid}
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          createdAt: serverTimestamp(),
        });

        // DELETE pendingUsers entry
        await deleteDoc(pendingRef);

        setStatus("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } catch (err) {
        console.error(err);
        setStatus("Verification link is invalid or expired.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}

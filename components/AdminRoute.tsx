"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        router.push("/");
        return;
      }

      setChecking(false); // now allowed
    });

    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="p-10 text-center text-xl">
        Checking admin permissions...
      </div>
    );
  }

  return <>{children}</>;
}

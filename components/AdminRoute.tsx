"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [checking, setChecking] = useState(true);

  const mainAdminEmail = "mandipchhetri0123@gmail.com";
  const mainAdminDob = "2001-09-06";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        router.push("/");
        return;
      }

      const data = userDoc.data();

      // ❌ If user is NOT admin → Block all admin pages
      if (data.role !== "admin") {
        router.push("/");
        return;
      }

      // 🔒 Restrict ONLY the manage-users page
      if (pathname.includes("manage-users")) {
        if (data.email !== mainAdminEmail || data.dob !== mainAdminDob) {
          router.push("/admin/dashboard"); // send to admin dashboard instead of home
          return;
        }
      }

      setChecking(false); // allow access
    });

    return () => unsub();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="p-10 text-center text-xl">
        Checking admin permissions...
      </div>
    );
  }

  return <>{children}</>;
}

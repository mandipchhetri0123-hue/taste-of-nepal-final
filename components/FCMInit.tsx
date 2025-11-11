'use client';
import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

export default function FCMInit() {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("🚫 This browser does not support notifications.");
      return;
    }

    // Register the service worker first
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration);

        const messaging = getMessaging(app);

        Notification.requestPermission().then(async (permission) => {
          if (permission === "granted") {
            console.log("🔔 Notification permission granted.");
            const token = await getToken(messaging, {
              vapidKey: "BKkrJ8kH9GxxX7y82-1ATr8-LPxrRydt0ckLJdfFdRlcshp25SPbsIB5cEeWajIZISbVM6cJ7Oi4D-ODwIebNuE",
              serviceWorkerRegistration: registration,
            });
            console.log("✅ FCM Token:", token);
            localStorage.setItem("fcmToken", token);
          } else {
            console.warn("🚫 Notification permission denied.");
          }
        });

        // Handle messages when app is open
        onMessage(messaging, (payload) => {
          new Notification(payload.notification?.title || "New Message", {
            body: payload.notification?.body,
          });
        });
      })
      .catch((err) => console.error("⚠️ Service Worker registration failed:", err));
  }, []);

  return null;
}



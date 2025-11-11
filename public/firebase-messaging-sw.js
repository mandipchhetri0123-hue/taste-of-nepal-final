// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBwzQLcI4g0FnA7ZIssKmEgqVm-lVXfok8",
  authDomain: "taste-of-nepal-3af40.firebaseapp.com",
  projectId: "taste-of-nepal-3af40",
  storageBucket: "taste-of-nepal-3af40.appspot.com",
  messagingSenderId: "954024083207",
  appId: "1:954024083207:web:fa942e64932e4a64778fa2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message ", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC1jgX3NCdfcaW_233q-KsOeb3MO4WIjr8",
  authDomain: "fcm-for-tutorconnect.firebaseapp.com",
  projectId: "fcm-for-tutorconnect",
  messagingSenderId: "837203762371",
  appId: "1:837203762371:web:fea1d6d43f418c3a441676",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

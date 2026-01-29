/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// REPLACE WITH YOUR FIREBASE CONFIG
// Since this is a static file in public/, we cannot use import.meta.env
// The user usually needs to manually paste the values or we configure a build step.
// For now, I will generate it with placeholders or try to instruct the user.
// BUT, to make it "Just Work" for the demo, I will try to rely on the default app if possible?
// No, compat libraries need explicit init.

const firebaseConfig = {
    // TODO: The user usually needs to fill this in for the SW to work in production
    // unless we use a build process to inject them. 
    // For this environment, I will attempt to locate them or leave comments.
    apiKey: "REPLACE_API_KEY",
    authDomain: "REPLACE_AUTH_DOMAIN",
    projectId: "REPLACE_PROJECT_ID",
    storageBucket: "REPLACE_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_MESSAGING_SENDER_ID",
    appId: "REPLACE_APP_ID"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/notifiq-logo.png' // Ensure this exists
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.log('Firebase SW init failed (probably missing config):', e);
}

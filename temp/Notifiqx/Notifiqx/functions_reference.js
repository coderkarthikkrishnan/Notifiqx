/**
 * Cloud Function to send FCM notifications when a new notice is created.
 * Deploy this to Firebase Cloud Functions.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

exports.sendNoticeNotification = onDocumentCreated("notices/{noticeId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }

    const notice = snapshot.data();
    const { title, collegeId, description } = notice;

    // 1. Find users in the same college
    const usersRef = db.collection('users');
    const snapshotUsers = await usersRef.where('collegeId', '==', collegeId).get();

    if (snapshotUsers.empty) {
        console.log('No users found for college:', collegeId);
        return;
    }

    // 2. Collect tokens
    const tokens = [];
    snapshotUsers.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
            tokens.push(...userData.fcmTokens);
        }
    });

    if (tokens.length === 0) {
        console.log('No tokens found.');
        return;
    }

    // 3. Send Multicast Message
    const message = {
        notification: {
            title: `New Notice: ${title}`,
            body: description.length > 50 ? description.substring(0, 50) + '...' : description,
        },
        tokens: tokens,
        webpush: {
            fcm_options: {
                link: '/viewer' // or specific notice link
            }
        }
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(response.successCount + ' messages were sent successfully');
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptBooking = void 0;
// functions/src/acceptBooking.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const web_push_1 = __importDefault(require("web-push"));
admin.initializeApp();
// VAPID keys should be set via Firebase functions config (see deployment docs)
const vapidPublicKey = functions.config().webpush?.public_key;
const vapidPrivateKey = functions.config().webpush?.private_key;
if (vapidPublicKey && vapidPrivateKey) {
    web_push_1.default.setVapidDetails('mailto:admin@ayaagaru.com', vapidPublicKey, vapidPrivateKey);
}
exports.acceptBooking = functions.https.onCall(async (data, context) => {
    // Authentication check – only logged‑in Pujari can call
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { bookingId, pujariName, pujariPhone, pujariLocation } = data;
    if (!bookingId) {
        throw new functions.https.HttpsError('invalid-argument', 'bookingId is required');
    }
    const bookingRef = admin.firestore().collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Booking not found');
    }
    // Update booking status and store pujari info
    await bookingRef.update({
        status: 'accepted',
        pujari: {
            name: pujariName || 'Pujari',
            phone: pujariPhone || '',
            location: pujariLocation || '',
        },
    });
    const bookingData = bookingSnap.data();
    const yajamaniId = bookingData?.yajamaniId; // assume this field exists
    const adminId = 'admin'; // simple placeholder for admin notifications
    const notifPayload = {
        type: 'pujari-accepted',
        title: 'Pujari Accepted',
        body: `${pujariName || 'Pujari'} accepted your booking`,
        payload: {
            name: pujariName,
            phone: pujariPhone,
            location: pujariLocation,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
    };
    // Helper to write notification for a given uid
    const writeNotif = async (uid) => {
        await admin
            .firestore()
            .collection('notifications')
            .doc(uid)
            .collection('items')
            .add(notifPayload);
    };
    // Notify Yajamani and admin
    if (yajamaniId) {
        await writeNotif(yajamaniId);
    }
    // Always notify admin (use a fixed admin uid or a configured one)
    await writeNotif(adminId);
    // Optional: send Web‑Push if subscription exists (mobile uses Capacitor push, not Web‑Push)
    if (vapidPublicKey && vapidPrivateKey && yajamaniId) {
        const subSnap = await admin.firestore().collection('push_subscriptions').doc(yajamaniId).get();
        if (subSnap.exists) {
            const subscription = { endpoint: subSnap.data().token };
            const pushMessage = JSON.stringify({
                title: notifPayload.title,
                body: notifPayload.body,
                data: notifPayload.payload,
            });
            try {
                await web_push_1.default.sendNotification(subscription, pushMessage);
            }
            catch (e) {
                console.warn('Web‑Push failed', e);
            }
        }
    }
    return { success: true };
});

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
// functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const web_push_1 = __importDefault(require("web-push"));
// Initialize admin only once
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// VAPID keys setup
const vapidPublicKey = functions.config().webpush?.public_key;
const vapidPrivateKey = functions.config().webpush?.private_key;
if (vapidPublicKey && vapidPrivateKey) {
    web_push_1.default.setVapidDetails('mailto:admin@ayaagaru.com', vapidPublicKey, vapidPrivateKey);
}
exports.acceptBooking = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        console.error('Unauthenticated call to acceptBooking');
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { bookingId, pujariName, pujariPhone, pujariLocation } = data;
    console.log(`Processing acceptBooking for ID: ${bookingId} by Pujari: ${pujariName}`);
    if (!bookingId) {
        throw new functions.https.HttpsError('invalid-argument', 'bookingId is required');
    }
    try {
        // 2. Fetch Booking Document
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
            console.error(`Booking with ID ${bookingId} not found`);
            throw new functions.https.HttpsError('not-found', 'Booking not found');
        }
        const bookingData = bookingSnap.data();
        console.log('Current booking data:', bookingData);
        // Using userId or falling back to yajamaniId if legacy
        const customerId = bookingData?.userId || bookingData?.yajamaniId;
        console.log(`Identified customerId: ${customerId}`);
        // 3. Update Booking Status
        await bookingRef.update({
            status: 'accepted',
            pujari: {
                name: pujariName || 'Pujari',
                phone: pujariPhone || '',
                location: pujariLocation || '',
                acceptedAt: admin.firestore.FieldValue.serverTimestamp()
            },
        });
        console.log('Booking status updated successfully');
        // 4. Create Notification Payload
        const notifPayload = {
            type: 'pujari-accepted',
            title: 'Pujari Accepted',
            body: `${pujariName || 'Pujari'} accepted your booking for ${bookingData?.ritualType || 'Ritual'}`,
            payload: {
                bookingId: bookingId,
                bookingRefId: bookingData?.bookingReferenceId || '',
                name: pujariName,
                phone: pujariPhone,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
        };
        // 5. Write Notifications
        const adminId = 'admin';
        const notificationPromises = [];
        if (customerId && customerId !== 'guest') {
            console.log(`Queueing notification for customer: ${customerId}`);
            notificationPromises.push(db.collection('notifications').doc(customerId).collection('items').add(notifPayload));
        }
        console.log('Queueing notification for admin');
        notificationPromises.push(db.collection('notifications').doc(adminId).collection('items').add(notifPayload));
        await Promise.all(notificationPromises);
        console.log('All notifications written successfully');
        return {
            success: true,
            message: 'Booking accepted and notifications sent',
            bookingId: bookingId
        };
    }
    catch (error) {
        console.error('CRITICAL ERROR in acceptBooking:', error);
        // Include specific error message in the rejection
        throw new functions.https.HttpsError('internal', error.message || 'Error processing booking');
    }
});

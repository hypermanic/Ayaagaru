// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import webpush from 'web-push';

// Initialize admin only once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// VAPID keys setup
const vapidPublicKey = functions.config().webpush?.public_key;
const vapidPrivateKey = functions.config().webpush?.private_key;
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:admin@ayaagaru.com', vapidPublicKey, vapidPrivateKey);
}

export const acceptBooking = functions.https.onCall(async (data: any, context) => {
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
    const notificationPromises: Promise<any>[] = [];

    if (customerId && customerId !== 'guest') {
      console.log(`Queueing notification for customer: ${customerId}`);
      notificationPromises.push(
        db.collection('notifications').doc(customerId).collection('items').add(notifPayload)
      );
    }

    console.log('Queueing notification for admin');
    notificationPromises.push(
      db.collection('notifications').doc(adminId).collection('items').add(notifPayload)
    );

    await Promise.all(notificationPromises);
    console.log('All notifications written successfully');

    return {
      success: true,
      message: 'Booking accepted and notifications sent',
      bookingId: bookingId
    };

  } catch (error: any) {
    console.error('CRITICAL ERROR in acceptBooking:', error);
    // Include specific error message in the rejection
    throw new functions.https.HttpsError('internal', error.message || 'Error processing booking');
  }
});

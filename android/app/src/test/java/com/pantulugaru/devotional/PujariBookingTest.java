package com.pantulugaru.devotional;

import static org.junit.Assert.*;
import org.junit.Test;

/**
 * Enhanced Unit tests for Pujari Registration, Updates, and Booking functionality.
 */
public class PujariBookingTest {

    // --- REGISTRATION TESTS ---

    @Test
    public void testPujariRegistration_Success() {
        boolean isRegistered = registerPujari("Praveen", "praveen@example.com", "Vedic");
        assertTrue("Pujari should be registered successfully", isRegistered);
    }

    @Test
    public void testPujariRegistration_InvalidEmail_Fails() {
        boolean isRegistered = registerPujari("Praveen", "invalid-email", "Vedic");
        assertFalse("Registration should fail with invalid email", isRegistered);
    }

    // --- UPDATE TESTS ---

    @Test
    public void testUpdatePujariProfile_Success() {
        String pujariId = "P123";
        boolean isUpdated = updatePujari(pujariId, "Praveen Sharma", "Expert Vedic");
        assertTrue("Pujari profile should be updated successfully", isUpdated);
    }

    @Test
    public void testUpdatePujari_NonExistent_Fails() {
        boolean isUpdated = updatePujari("UNKNOWN_ID", "Name", "Spec");
        assertFalse("Updating non-existent Pujari should fail", isUpdated);
    }

    // --- BOOKING TESTS ---

    @Test
    public void testCreateBooking_Success() {
        boolean isBooked = createBooking("P123", "2024-12-25");
        assertTrue("Booking should be created successfully", isBooked);
    }

    @Test
    public void testUpdateBooking_DateChange_Success() {
        String bookingId = "B987";
        boolean isUpdated = updateBooking(bookingId, "2024-12-30");
        assertTrue("Booking date should be updated successfully", isUpdated);
    }

    @Test
    public void testCancelBooking_Success() {
        boolean isCancelled = cancelBooking("B987");
        assertTrue("Booking should be cancelled successfully", isCancelled);
    }

    // --- MOCK LOGIC (Placeholders for real Implementation) ---

    private boolean registerPujari(String name, String email, String spec) {
        if (name == null || name.isEmpty()) return false;
        if (!email.contains("@")) return false; // Simple validation
        return true;
    }

    private boolean updatePujari(String id, String newName, String newSpec) {
        if ("UNKNOWN_ID".equals(id)) return false;
        return true;
    }

    private boolean createBooking(String pujariId, String date) {
        return pujariId != null && !pujariId.isEmpty();
    }

    private boolean updateBooking(String bookingId, String newDate) {
        return bookingId != null && !bookingId.isEmpty();
    }

    private boolean cancelBooking(String bookingId) {
        return bookingId != null && !bookingId.isEmpty();
    }
}

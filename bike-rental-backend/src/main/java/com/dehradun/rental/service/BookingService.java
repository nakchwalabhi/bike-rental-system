package com.dehradun.rental.service;

import com.dehradun.rental.model.Booking;
import com.dehradun.rental.model.User;
import com.dehradun.rental.repository.BookingRepository;
import com.dehradun.rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public Booking createBooking(Long userId, String vehicleName, String pickupTime,
                                  String dropoffTime, String garage, String notes,
                                  Double totalAmount) {
        User user = userRepository.findById(userId).orElse(null);

        Booking booking = new Booking();
        booking.setBookingRef("BR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setGarage(garage);
        booking.setNotes(notes);
        booking.setTotalAmount(totalAmount);
        booking.setHalfAmount(totalAmount != null ? totalAmount / 2 : 0);
        booking.setPaymentStatus("PENDING");

        // Accept both "2024-01-15T10:30" (datetime-local HTML input, no seconds)
        // and "2024-01-15T10:30:00" (ISO with seconds).
        DateTimeFormatter fmt = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd'T'HH:mm")
            .optionalStart().appendPattern(":ss").optionalEnd()
            .toFormatter();
        if (pickupTime != null && !pickupTime.isEmpty()) {
            booking.setPickupTime(LocalDateTime.parse(pickupTime, fmt));
        }
        if (dropoffTime != null && !dropoffTime.isEmpty()) {
            booking.setDropoffTime(LocalDateTime.parse(dropoffTime, fmt));
        }

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking updatePaymentStatus(Long bookingId, String razorpayOrderId, String razorpayPaymentId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setRazorpayOrderId(razorpayOrderId);
        booking.setRazorpayPaymentId(razorpayPaymentId);
        booking.setPaymentStatus("HALF_PAID");
        return bookingRepository.save(booking);
    }
}

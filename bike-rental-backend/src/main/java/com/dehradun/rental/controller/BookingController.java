package com.dehradun.rental.controller;

import com.dehradun.rental.model.Booking;
import com.dehradun.rental.service.BookingService;
import com.dehradun.rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Long userId = body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : null;
            String vehicleId = body.get("vehicleId") != null ? body.get("vehicleId").toString() : null;
            String pickupTime = (String) body.get("pickupTime");
            String dropoffTime = (String) body.get("dropoffTime");
            String garage = (String) body.get("garage");
            String notes = (String) body.get("notes");
            Double totalAmount = body.get("totalAmount") != null ? Double.valueOf(body.get("totalAmount").toString()) : 0;

            Booking booking = bookingService.createBooking(userId, vehicleId, pickupTime, dropoffTime, garage, notes, totalAmount);
            return ResponseEntity.ok(Map.of(
                "bookingRef", booking.getBookingRef(),
                "bookingId", booking.getId(),
                "halfAmount", booking.getHalfAmount(),
                "totalAmount", booking.getTotalAmount()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/payment/{bookingId}")
    public ResponseEntity<?> updatePayment(
        @PathVariable Long bookingId,
        @RequestBody Map<String, String> body
    ) {
        try {
            String razorpayOrderId = body.get("razorpayOrderId");
            String razorpayPaymentId = body.get("razorpayPaymentId");
            String razorpaySignature = body.get("razorpaySignature");
            if (!paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Razorpay payment verification failed"));
            }

            Booking booking = bookingService.updatePaymentStatus(
                bookingId,
                razorpayOrderId,
                razorpayPaymentId
            );
            return ResponseEntity.ok(Map.of(
                "bookingRef", booking.getBookingRef(),
                "paymentStatus", booking.getPaymentStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }
}

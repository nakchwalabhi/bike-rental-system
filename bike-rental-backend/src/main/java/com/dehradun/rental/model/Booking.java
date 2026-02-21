package com.dehradun.rental.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingRef;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private LocalDateTime pickupTime;
    private LocalDateTime dropoffTime;

    private String garage;
    private String notes;

    private Double totalAmount;
    private Double halfAmount;

    private String paymentStatus; // PENDING, HALF_PAID, FULL_PAID
    private String razorpayOrderId;
    private String razorpayPaymentId;
}

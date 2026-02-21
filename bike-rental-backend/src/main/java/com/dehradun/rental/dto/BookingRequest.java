package com.dehradun.rental.dto;

public record BookingRequest(
    Long userId,
    String vehicleId,
    String pickupTime,
    String dropoffTime,
    String garage,
    String notes,
    Double totalAmount
) {}

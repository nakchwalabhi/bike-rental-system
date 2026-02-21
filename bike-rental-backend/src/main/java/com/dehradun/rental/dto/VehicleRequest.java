package com.dehradun.rental.dto;

public record VehicleRequest(
    String name,
    String type,
    Integer pricePerHour,
    Integer pricePerDay,
    String status,
    Long vendorId
) {}

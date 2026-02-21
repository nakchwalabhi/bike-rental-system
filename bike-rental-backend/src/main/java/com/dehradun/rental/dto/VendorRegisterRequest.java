package com.dehradun.rental.dto;

public record VendorRegisterRequest(
    String ownerName,
    String vendorName,
    String location,
    String contact,
    String email,
    String password
) {}

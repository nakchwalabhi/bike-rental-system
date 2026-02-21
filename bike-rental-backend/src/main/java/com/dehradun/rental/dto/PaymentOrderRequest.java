package com.dehradun.rental.dto;

public record PaymentOrderRequest(Double amount, String currency, String receipt) {}

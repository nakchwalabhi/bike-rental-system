package com.dehradun.rental.controller;

import com.dehradun.rental.dto.PaymentOrderRequest;
import com.dehradun.rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody PaymentOrderRequest req) {
        Map<String, Object> order = paymentService.createOrder(req.amount(), req.currency(), req.receipt());
        boolean configured = Boolean.TRUE.equals(order.get("configured"));
        return configured ? ResponseEntity.ok(order) : ResponseEntity.badRequest().body(order);
    }
}

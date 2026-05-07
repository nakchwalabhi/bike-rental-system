package com.dehradun.rental.controller;

import com.dehradun.rental.dto.PaymentOrderRequest;
import com.dehradun.rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
        try {
            Map<String, Object> order = paymentService.createOrder(req.amount(), req.currency(), req.receipt());
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "Payment service temporarily unavailable"));
        }
    }
}

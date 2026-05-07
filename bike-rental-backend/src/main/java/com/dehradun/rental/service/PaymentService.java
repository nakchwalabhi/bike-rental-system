package com.dehradun.rental.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Map<String, Object> createOrder(Double amount, String currency, String receipt) {
        Map<String, Object> response = new HashMap<>();
        if (keyId == null || keySecret == null || keyId.contains("placeholder") || keySecret.contains("placeholder")) {
            response.put("configured", false);
            response.put("error", "Razorpay is not configured");
            return response;
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", (int)(amount * 100)); // in paise
            options.put("currency", currency != null ? currency : "INR");
            options.put("receipt", receipt);
            Order order = client.orders.create(options);
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", keyId);
            response.put("configured", true);
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            response.put("configured", false);
            response.put("error", "Unable to create Razorpay order");
        }
        return response;
    }
}

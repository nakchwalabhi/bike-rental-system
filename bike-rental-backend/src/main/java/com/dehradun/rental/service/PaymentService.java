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
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            // For demo/test mode, return mock order
            response.put("orderId", "order_demo_" + System.currentTimeMillis());
            response.put("amount", (int)(amount * 100));
            response.put("currency", "INR");
            response.put("keyId", keyId);
        }
        return response;
    }
}

package com.dehradun.rental.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null
            || razorpayOrderId.isBlank() || razorpayPaymentId.isBlank() || razorpaySignature.isBlank()
            || keySecret == null || keySecret.isBlank()) {
            return false;
        }
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expectedSignature = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                razorpaySignature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Razorpay signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public Map<String, Object> createOrder(Double amount, String currency, String receipt) {
        Map<String, Object> response = new HashMap<>();
        if (amount == null || amount <= 0) {
            response.put("configured", false);
            response.put("error", "Payment amount must be greater than zero");
            return response;
        }
        if (keyId == null || keySecret == null || keyId.isBlank() || keySecret.isBlank()
            || keyId.contains("placeholder") || keySecret.contains("placeholder")) {
            response.put("configured", false);
            response.put("error", "Razorpay is not configured");
            return response;
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", Math.round(amount * 100)); // in paise
            options.put("currency", currency != null && !currency.isBlank() ? currency : "INR");
            options.put("receipt", receipt != null && !receipt.isBlank() ? receipt : "booking-advance");
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

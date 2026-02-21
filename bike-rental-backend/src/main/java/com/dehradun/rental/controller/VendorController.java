package com.dehradun.rental.controller;

import com.dehradun.rental.dto.VendorLoginRequest;
import com.dehradun.rental.dto.VendorRegisterRequest;
import com.dehradun.rental.model.Vendor;
import com.dehradun.rental.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody VendorRegisterRequest req) {
        try {
            String msg = vendorService.register(req);
            return ResponseEntity.ok(Map.of("message", msg));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody VendorLoginRequest req) {
        try {
            Vendor vendor = vendorService.login(req);
            return ResponseEntity.ok(vendor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

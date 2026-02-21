package com.dehradun.rental.service;

import com.dehradun.rental.dto.VendorLoginRequest;
import com.dehradun.rental.dto.VendorRegisterRequest;
import com.dehradun.rental.model.Vendor;
import com.dehradun.rental.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public String register(VendorRegisterRequest req) {
        if (vendorRepository.findByEmail(req.email()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        Vendor vendor = new Vendor();
        vendor.setOwnerName(req.ownerName());
        vendor.setVendorName(req.vendorName());
        vendor.setLocation(req.location());
        vendor.setContact(req.contact());
        vendor.setEmail(req.email());
        vendor.setPassword(passwordEncoder.encode(req.password()));
        vendorRepository.save(vendor);
        return "Vendor registration successful";
    }

    public Vendor login(VendorLoginRequest req) {
        Vendor vendor = vendorRepository.findByEmail(req.email())
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        if (!passwordEncoder.matches(req.password(), vendor.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return vendor;
    }
}

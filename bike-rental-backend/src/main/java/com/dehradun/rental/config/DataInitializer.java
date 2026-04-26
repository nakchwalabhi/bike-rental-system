package com.dehradun.rental.config;

import com.dehradun.rental.model.Vendor;
import com.dehradun.rental.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin vendor account on every startup if it does not already exist.
 * Credentials: username = admin  /  password = nakchwal14
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (vendorRepository.findByEmail("admin").isEmpty()) {
            Vendor admin = new Vendor();
            admin.setOwnerName("Admin");
            admin.setVendorName("Admin");
            admin.setEmail("admin");
            admin.setLocation("Dehradun");
            admin.setContact("-");
            admin.setPassword(passwordEncoder.encode("nakchwal14"));
            vendorRepository.save(admin);
            log.info("Default admin vendor seeded (username: admin).");
        }
    }
}

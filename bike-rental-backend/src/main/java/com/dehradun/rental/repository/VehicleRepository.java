package com.dehradun.rental.repository;

import com.dehradun.rental.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByVendorId(Long vendorId);
}

package com.dehradun.rental.service;

import com.dehradun.rental.dto.VehicleRequest;
import com.dehradun.rental.model.Vehicle;
import com.dehradun.rental.model.Vendor;
import com.dehradun.rental.repository.VehicleRepository;
import com.dehradun.rental.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VendorRepository vendorRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getByVendor(Long vendorId) {
        return vehicleRepository.findByVendorId(vendorId);
    }

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    public Vehicle add(VehicleRequest req) {
        Vendor vendor = vendorRepository.findById(req.vendorId())
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        Vehicle v = new Vehicle();
        v.setName(req.name());
        v.setType(req.type());
        v.setPricePerHour(req.pricePerHour());
        v.setPricePerDay(req.pricePerDay());
        v.setStatus(req.status() != null ? req.status() : "Available");
        v.setVendor(vendor);
        return vehicleRepository.save(v);
    }

    public Vehicle update(Long id, VehicleRequest req) {
        Vehicle v = getById(id);
        if (req.name() != null) v.setName(req.name());
        if (req.type() != null) v.setType(req.type());
        if (req.pricePerHour() != null) v.setPricePerHour(req.pricePerHour());
        if (req.pricePerDay() != null) v.setPricePerDay(req.pricePerDay());
        if (req.status() != null) v.setStatus(req.status());
        return vehicleRepository.save(v);
    }

    public void delete(Long id) {
        vehicleRepository.deleteById(id);
    }
}

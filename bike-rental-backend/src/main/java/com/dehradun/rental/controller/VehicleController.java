package com.dehradun.rental.controller;

import com.dehradun.rental.dto.VehicleRequest;
import com.dehradun.rental.model.Vehicle;
import com.dehradun.rental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping("/api/vehicle/all")
    public List<Vehicle> getAll() {
        return vehicleService.getAll();
    }

    @GetMapping("/api/vehicle/get/{id}")
    public Vehicle getById(@PathVariable Long id) {
        return vehicleService.getById(id);
    }

    @GetMapping("/api/vendor/vehicle/all/{vendorId}")
    public List<Vehicle> getByVendor(@PathVariable Long vendorId) {
        return vehicleService.getByVendor(vendorId);
    }

    @PostMapping("/api/vendor/vehicle/add")
    public ResponseEntity<?> add(@RequestBody VehicleRequest req) {
        try {
            Vehicle v = vehicleService.add(req);
            return ResponseEntity.ok(v);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/api/vendor/vehicle/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody VehicleRequest req) {
        try {
            Vehicle v = vehicleService.update(id, req);
            return ResponseEntity.ok(v);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/api/vendor/vehicle/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.ok("Deleted");
    }
}

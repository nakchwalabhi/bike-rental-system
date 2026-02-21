package com.dehradun.rental.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // bike or scooty

    private Integer pricePerHour;
    private Integer pricePerDay;
    private String status; // Available, Booked

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
}

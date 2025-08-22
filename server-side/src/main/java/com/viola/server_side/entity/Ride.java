package com.viola.server_side.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String pickup;
    
    @Column(nullable = false)
    private String destination;
    
    @Column(name = "ride_time", nullable = false)
    private LocalDateTime rideTime;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Boolean negotiable;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructor for creating new rides
    public Ride(String pickup, String destination, LocalDateTime rideTime, 
                BigDecimal price, Boolean negotiable, String description, User owner) {
        this.pickup = pickup;
        this.destination = destination;
        this.rideTime = rideTime;
        this.price = price;
        this.negotiable = negotiable;
        this.description = description;
        this.owner = owner;
    }
}

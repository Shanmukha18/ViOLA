package com.viola.server_side.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    
    @Column(name = "ride_date", nullable = false)
    private String rideDate;
    
    @Column(name = "ride_time", nullable = false)
    private String rideTime;
    
    @Column(nullable = false)
    private String price;
    
    @Column(nullable = false)
    private Boolean negotiable;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender_preference", nullable = false)
    private GenderPreference genderPreference = GenderPreference.ANYONE;
    
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
    public Ride(String pickup, String destination, String rideDate, 
                String rideTime, String price, Boolean negotiable, String description, 
                GenderPreference genderPreference, User owner) {
        this.pickup = pickup;
        this.destination = destination;
        this.rideDate = rideDate;
        this.rideTime = rideTime;
        this.price = price;
        this.negotiable = negotiable;
        this.description = description;
        this.genderPreference = genderPreference;
        this.owner = owner;
    }
}

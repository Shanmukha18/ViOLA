package com.viola.server_side.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructor for Google OAuth2 user creation
    public User(String email, String name, String photoUrl, String googleId) {
        this.email = email;
        this.name = name;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
        this.isVerified = email.endsWith("@vit.ac.in") || email.endsWith("@vitstudent.ac.in"); // Auto-verify VIT students
    }
}

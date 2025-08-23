package com.viola.server_side.dto;

import com.viola.server_side.entity.GenderPreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRideRequest {
    
    @NotBlank(message = "Pickup location is required")
    private String pickup;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotNull(message = "Ride time is required")
    private LocalDateTime rideTime;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotNull(message = "Negotiable status is required")
    private Boolean negotiable;
    
    private String description;
    
    @NotNull(message = "Gender preference is required")
    private GenderPreference genderPreference = GenderPreference.ANYONE;
}

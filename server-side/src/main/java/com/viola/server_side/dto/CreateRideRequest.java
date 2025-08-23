package com.viola.server_side.dto;

import com.viola.server_side.entity.GenderPreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRideRequest {
    
    @NotBlank(message = "Pickup location is required")
    private String pickup;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotBlank(message = "Ride date is required")
    private String rideDate;
    
    @NotBlank(message = "Ride time is required")
    private String rideTime;
    
    @NotBlank(message = "Price is required")
    @Pattern(regexp = "^[1-9]\\d*$", message = "Price must be a positive number starting with a non-zero digit")
    // This regex ensures: ^[1-9] (starts with 1-9) \\d* (followed by any number of digits)
    private String price;
    
    @NotNull(message = "Negotiable status is required")
    private Boolean negotiable;
    
    private String description;
    
    @NotNull(message = "Gender preference is required")
    private GenderPreference genderPreference = GenderPreference.ANYONE;
}

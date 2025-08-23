package com.viola.server_side.dto;

import com.viola.server_side.entity.GenderPreference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideDto {
    private Long id;
    private String pickup;
    private String destination;
    private String rideDate;
    private String rideTime;
    private String price;
    private Boolean negotiable;
    private String description;
    private GenderPreference genderPreference;
    private UserDto owner;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

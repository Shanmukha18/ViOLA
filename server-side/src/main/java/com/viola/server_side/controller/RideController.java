package com.viola.server_side.controller;

import com.viola.server_side.dto.CreateRideRequest;
import com.viola.server_side.dto.RideDto;
import com.viola.server_side.security.JwtUtil;
import com.viola.server_side.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RideController {
    
    private final RideService rideService;
    private final JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<List<RideDto>> getAllRides() {
        List<RideDto> rides = rideService.getAllActiveRides();
        return ResponseEntity.ok(rides);
    }
    
    @GetMapping("/{rideId}")
    public ResponseEntity<RideDto> getRideById(@PathVariable Long rideId) {
        RideDto ride = rideService.getRideById(rideId);
        return ResponseEntity.ok(ride);
    }
    
    @PostMapping
    public ResponseEntity<RideDto> createRide(@Valid @RequestBody CreateRideRequest request,
                                            HttpServletRequest httpRequest) {
        String token = extractTokenFromRequest(httpRequest);
        Long userId = jwtUtil.extractUserId(token);
        
        RideDto createdRide = rideService.createRide(request, userId);
        return ResponseEntity.ok(createdRide);
    }
    
    @PutMapping("/{rideId}")
    public ResponseEntity<RideDto> updateRide(@PathVariable Long rideId,
                                            @Valid @RequestBody CreateRideRequest request,
                                            HttpServletRequest httpRequest) {
        String token = extractTokenFromRequest(httpRequest);
        Long userId = jwtUtil.extractUserId(token);
        
        RideDto updatedRide = rideService.updateRide(rideId, request, userId);
        return ResponseEntity.ok(updatedRide);
    }
    
    @DeleteMapping("/{rideId}")
    public ResponseEntity<?> deactivateRide(@PathVariable Long rideId,
                                          HttpServletRequest httpRequest) {
        String token = extractTokenFromRequest(httpRequest);
        Long userId = jwtUtil.extractUserId(token);
        
        rideService.deactivateRide(rideId, userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/my-rides")
    public ResponseEntity<List<RideDto>> getMyRides(HttpServletRequest httpRequest) {
        String token = extractTokenFromRequest(httpRequest);
        Long userId = jwtUtil.extractUserId(token);
        
        List<RideDto> rides = rideService.getRidesByOwner(userId);
        return ResponseEntity.ok(rides);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }
}

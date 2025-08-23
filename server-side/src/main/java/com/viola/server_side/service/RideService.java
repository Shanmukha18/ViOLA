package com.viola.server_side.service;

import com.viola.server_side.dto.CreateRideRequest;
import com.viola.server_side.dto.RideDto;
import com.viola.server_side.entity.Ride;
import com.viola.server_side.entity.User;
import com.viola.server_side.repository.RideRepository;
import com.viola.server_side.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {
    
    private final RideRepository rideRepository;
    private final UserService userService;
    private final MessageRepository messageRepository;
    
    public RideDto createRide(CreateRideRequest request, Long userId) {
        User owner = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Ride ride = new Ride(
            request.getPickup(),
            request.getDestination(),
            request.getRideDate(),
            request.getRideTime(),
            request.getPrice(),
            request.getNegotiable(),
            request.getDescription(),
            request.getGenderPreference(),
            owner
        );
        
        Ride savedRide = rideRepository.save(ride);
        return convertToDto(savedRide);
    }
    
    public List<RideDto> getAllActiveRides() {
        return rideRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<RideDto> getRidesByOwner(Long ownerId) {
        return rideRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public RideDto getRideById(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
        return convertToDto(ride);
    }
    
    public RideDto updateRide(Long rideId, CreateRideRequest request, Long userId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
        
        if (!ride.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own rides");
        }
        
        ride.setPickup(request.getPickup());
        ride.setDestination(request.getDestination());
        ride.setRideDate(request.getRideDate());
        ride.setRideTime(request.getRideTime());
        ride.setPrice(request.getPrice());
        ride.setNegotiable(request.getNegotiable());
        ride.setDescription(request.getDescription());
        ride.setGenderPreference(request.getGenderPreference());
        
        Ride updatedRide = rideRepository.save(ride);
        return convertToDto(updatedRide);
    }
    
    public void deactivateRide(Long rideId, Long userId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
        
        if (!ride.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only deactivate your own rides");
        }
        
        ride.setIsActive(false);
        rideRepository.save(ride);
    }
    
    @Transactional
    public void deleteRidePermanently(Long rideId, Long userId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
        
        if (!ride.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own rides");
        }
        
        if (ride.getIsActive()) {
            throw new IllegalArgumentException("You can only delete resolved rides");
        }
        
        // Delete all messages associated with this ride first
        messageRepository.deleteByRideId(rideId);
        
        // Now delete the ride
        rideRepository.delete(ride);
    }
    
    private RideDto convertToDto(Ride ride) {
        return new RideDto(
            ride.getId(),
            ride.getPickup(),
            ride.getDestination(),
            ride.getRideDate(),
            ride.getRideTime(),
            ride.getPrice(),
            ride.getNegotiable(),
            ride.getDescription(),
            ride.getGenderPreference(),
            userService.convertToDto(ride.getOwner()),
            ride.getIsActive(),
            ride.getCreatedAt()
        );
    }
}

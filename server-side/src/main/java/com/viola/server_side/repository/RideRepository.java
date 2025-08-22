package com.viola.server_side.repository;

import com.viola.server_side.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    
    List<Ride> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Ride> findByOwnerIdAndIsActiveTrueOrderByCreatedAtDesc(Long ownerId);
    
    List<Ride> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    
    @Query("SELECT r FROM Ride r WHERE r.isActive = true AND r.rideTime >= :now ORDER BY r.rideTime ASC")
    List<Ride> findUpcomingRides(LocalDateTime now);
    
    List<Ride> findByPickupContainingIgnoreCaseOrDestinationContainingIgnoreCaseAndIsActiveTrue(
            String pickup, String destination);
}

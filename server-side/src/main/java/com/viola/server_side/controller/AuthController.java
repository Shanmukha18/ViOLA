package com.viola.server_side.controller;

import com.viola.server_side.dto.UserDto;
import com.viola.server_side.entity.User;
import com.viola.server_side.security.JwtUtil;
import com.viola.server_side.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleAuthRequest request) {
        try {
            // In a real implementation, you would verify the Google ID token here
            // For now, we'll trust the client-provided information
            
            User user = userService.createOrUpdateUser(
                request.getEmail(),
                request.getName(),
                request.getPhotoUrl(),
                request.getGoogleId()
            );
            
            String token = jwtUtil.generateToken(user.getEmail(), user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userService.convertToDto(user));
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Authentication failed"));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(userService.convertToDto(user));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody ProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user name
        user.setName(request.getName());
        
        User updatedUser = userService.createOrUpdateUser(
            user.getEmail(),
            user.getName(),
            user.getPhotoUrl(),
            user.getGoogleId()
        );
        return ResponseEntity.ok(userService.convertToDto(updatedUser));
    }
    
    // DTO for Google authentication request
    public static class GoogleAuthRequest {
        private String email;
        private String name;
        private String photoUrl;
        private String googleId;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        
        public String getGoogleId() { return googleId; }
        public void setGoogleId(String googleId) { this.googleId = googleId; }
    }
    
    // DTO for profile update request
    public static class ProfileUpdateRequest {
        private String name;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}

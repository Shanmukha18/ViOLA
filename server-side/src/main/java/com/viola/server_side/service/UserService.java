package com.viola.server_side.service;

import com.viola.server_side.dto.UserDto;
import com.viola.server_side.entity.User;
import com.viola.server_side.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public User createOrUpdateUser(String email, String name, String photoUrl, String googleId) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            user.setPhotoUrl(photoUrl);
            user.setGoogleId(googleId);
            return userRepository.save(user);
        } else {
            // Check if email is from VIT domain
            if (!email.endsWith("@vit.ac.in") && !email.endsWith("@vitstudent.ac.in")) {
                throw new IllegalArgumentException("Only VIT students with @vit.ac.in or @vitstudent.ac.in emails are allowed to register");
            }
            
            User newUser = new User(email, name, photoUrl, googleId);
            return userRepository.save(newUser);
        }
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public UserDto convertToDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhotoUrl(),
            user.getIsVerified(),
            user.getCreatedAt()
        );
    }
}

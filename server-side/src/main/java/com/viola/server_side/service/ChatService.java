package com.viola.server_side.service;

import com.viola.server_side.dto.ChatMessage;
import com.viola.server_side.dto.MessageDto;
import com.viola.server_side.entity.Message;
import com.viola.server_side.entity.User;
import com.viola.server_side.entity.Ride;
import com.viola.server_side.repository.MessageRepository;
import com.viola.server_side.repository.UserRepository;
import com.viola.server_side.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RideRepository rideRepository;

    public MessageDto saveMessage(ChatMessage chatMessage) {
        try {
            // Find sender and receiver
            User sender = userRepository.findById(Long.parseLong(chatMessage.getSenderId()))
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            User receiver = null;
            if (chatMessage.getReceiverId() != null && !chatMessage.getReceiverId().isEmpty()) {
                receiver = userRepository.findById(Long.parseLong(chatMessage.getReceiverId()))
                        .orElseThrow(() -> new RuntimeException("Receiver not found"));
            }

            // Find ride
            Ride ride = rideRepository.findById(chatMessage.getRideId())
                    .orElseThrow(() -> new RuntimeException("Ride not found"));

            // Create and save message
            Message message = new Message();
            message.setContent(chatMessage.getContent());
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setRide(ride);
            message.setIsRead(false);
            message.setCreatedAt(LocalDateTime.now());

            Message savedMessage = messageRepository.save(message);
            log.info("Saved message: {}", savedMessage.getId());
            
            return convertToDto(savedMessage);
        } catch (Exception e) {
            log.error("Error saving message: {}", e.getMessage());
            throw new RuntimeException("Failed to save message", e);
        }
    }

    public List<MessageDto> getMessagesByRideId(Long rideId) {
        List<Message> messages = messageRepository.findMessagesByRideId(rideId);
        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MessageDto> getConversationBetweenUsers(String userId) {
        // This would need to be implemented based on your chat logic
        // For now, return empty list
        return List.of();
    }

    public List<MessageDto> getUnreadMessagesForUser() {
        // This would need to be implemented based on your chat logic
        // For now, return empty list
        return List.of();
    }

    private MessageDto convertToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setIsRead(message.getIsRead());
        dto.setRideId(message.getRide() != null ? message.getRide().getId() : null);
        
        if (message.getSender() != null) {
            dto.setSender(convertUserToDto(message.getSender()));
        }
        
        if (message.getReceiver() != null) {
            dto.setReceiver(convertUserToDto(message.getReceiver()));
        }
        
        return dto;
    }

    private com.viola.server_side.dto.UserDto convertUserToDto(User user) {
        com.viola.server_side.dto.UserDto dto = new com.viola.server_side.dto.UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setIsVerified(user.getIsVerified());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}

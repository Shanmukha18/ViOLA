package com.viola.server_side.controller;

import com.viola.server_side.dto.ChatMessage;
import com.viola.server_side.dto.MessageDto;
import com.viola.server_side.entity.Ride;
import com.viola.server_side.repository.RideRepository;
import com.viola.server_side.security.JwtUtil;
import com.viola.server_side.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;
import com.viola.server_side.entity.Message;
import com.viola.server_side.entity.User;
import com.viola.server_side.repository.UserRepository;
import com.viola.server_side.repository.MessageRepository;

@Controller
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RideRepository rideRepository;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        log.info("Received message: {}", chatMessage);
        log.info("Message details - senderId: {}, rideId: {}, content: {}", 
                chatMessage.getSenderId(), chatMessage.getRideId(), chatMessage.getContent());
        
        try {
            // Save message to database
            MessageDto savedMessage = chatService.saveMessage(chatMessage);
            log.info("Message saved to database with ID: {}", savedMessage.getId());
            
            // Send to ride-specific chat if rideId is provided
            if (chatMessage.getRideId() != null) {
                String topic = "/topic/ride." + chatMessage.getRideId();
                log.info("Broadcasting message to topic: {}", topic);
                log.info("Message content: {}", chatMessage.getContent());
                log.info("Message sender: {}", chatMessage.getSenderId());
                log.info("Message receiver: {}", chatMessage.getReceiverId());
                
                try {
                    messagingTemplate.convertAndSend(topic, chatMessage);
                    log.info("Message successfully sent to topic: {}", topic);
                } catch (Exception e) {
                    log.error("Error broadcasting message to topic {}: {}", topic, e.getMessage(), e);
                }
            } else {
                log.warn("No rideId provided for message, not sending to ride chat");
            }
            
            // Send to specific user if it's a private message
            if (chatMessage.getReceiverId() != null && !chatMessage.getReceiverId().isEmpty()) {
                log.info("Sending private message to user: {}", chatMessage.getReceiverId());
                messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId(),
                    "/queue/private",
                    chatMessage
                );
                log.info("Private message sent to user: {}", chatMessage.getReceiverId());
            }
            
            return chatMessage;
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
            throw e;
        }
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username to web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSenderId());
        headerAccessor.getSessionAttributes().put("rideId", chatMessage.getRideId());
        
        log.info("User {} joined chat for ride {}", chatMessage.getSenderId(), chatMessage.getRideId());
        return chatMessage;
    }

    @MessageMapping("/chat.joinRide")
    public void joinRideChat(@Payload ChatMessage chatMessage, Principal principal) {
        log.info("Join ride chat request received: {}", chatMessage);
        if (principal != null) {
            String rideId = chatMessage.getRideId().toString();
            String userId = principal.getName();
            
            log.info("User {} joined ride chat {}", userId, rideId);
        } else {
            log.warn("No principal found for join ride chat request");
        }
    }

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage) {
        // Send private message to specific user
        messagingTemplate.convertAndSendToUser(
            chatMessage.getReceiverId(),
            "/queue/private",
            chatMessage
        );
        
        // Also send to sender (for confirmation)
        messagingTemplate.convertAndSendToUser(
            chatMessage.getSenderId(),
            "/queue/private",
            chatMessage
        );
    }

    // REST endpoints for chat history
    @GetMapping("/api/chat/ride/{rideId}")
    @ResponseBody
    public List<MessageDto> getRideChatHistory(@PathVariable Long rideId, HttpServletRequest request) {
        // Extract user ID from JWT token
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing JWT token");
        }
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, username)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
            }
            
            Long userId = jwtUtil.extractUserId(token);
            
            // Get the ride to verify it exists
            Ride ride = rideRepository.findById(rideId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));
            
            // Get all messages for this ride that involve the current user
            // (either sent by or received by the current user)
            List<Message> messages = messageRepository.findMessagesByRideId(rideId);
            List<Message> userMessages = messages.stream()
                    .filter(msg -> msg.getSender().getId().equals(userId) || msg.getReceiver().getId().equals(userId))
                    .collect(Collectors.toList());
            
            return userMessages.stream()
                    .map(this::convertMessageToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting chat history: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
        }
    }

    @GetMapping("/api/chat/conversation/{userId}")
    @ResponseBody
    public List<MessageDto> getConversationHistory(@PathVariable String userId) {
        return chatService.getConversationBetweenUsers(userId);
    }

    @GetMapping("/api/chat/unread")
    @ResponseBody
    public List<MessageDto> getUnreadMessages() {
        return chatService.getUnreadMessagesForUser();
    }

    @GetMapping("/api/chat/conversations")
    @ResponseBody
    public List<Map<String, Object>> getConversations(HttpServletRequest request) {
        // Extract user ID from JWT token
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing JWT token");
        }
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, username)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
            }
            
            Long userId = jwtUtil.extractUserId(token);
        
        // Get user's rides and conversations
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        // Get unread messages for this user to check which conversations have unread messages
        List<Message> unreadMessages = messageRepository.findUnreadMessagesForUser(userId);
        Set<Long> unreadRideIds = unreadMessages.stream()
            .map(msg -> msg.getRide().getId())
            .collect(Collectors.toSet());
        
        // Get rides created by the user
        List<Ride> userRides = rideRepository.findByOwnerIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        for (Ride ride : userRides) {
            // Find the most recent message sender (other than the ride owner) to show as conversation partner
            List<Message> rideMessages = messageRepository.findMessagesByRideId(ride.getId());
            User conversationPartner = null;
            Message lastMessage = null;
            
            if (!rideMessages.isEmpty()) {
                // Find the first message from someone other than the ride owner
                for (Message msg : rideMessages) {
                    if (!msg.getSender().getId().equals(userId)) {
                        conversationPartner = msg.getSender();
                        lastMessage = msg;
                        break;
                    }
                }
            }
            
            // Only add conversation if there's actually a conversation partner (someone messaged about this ride)
            if (conversationPartner != null && !conversationPartner.getId().equals(userId)) {
                // Check if this conversation has unread messages
                boolean hasUnreadMessages = unreadRideIds.contains(ride.getId());
                
                Map<String, Object> conv = new HashMap<>();
                conv.put("id", ride.getId());
                conv.put("ride", Map.of(
                    "id", ride.getId(),
                    "pickup", ride.getPickup(),
                    "destination", ride.getDestination()
                ));
                conv.put("user", Map.of(
                    "id", conversationPartner.getId(),
                    "name", conversationPartner.getName(),
                    "email", conversationPartner.getEmail()
                ));
                conv.put("lastMessage", lastMessage != null ? lastMessage.getContent() : (ride.getPickup() + " to " + ride.getDestination()));
                conv.put("lastMessageTime", lastMessage != null ? lastMessage.getCreatedAt() : ride.getCreatedAt());
                conv.put("hasUnreadMessages", hasUnreadMessages);
                conv.put("isOwner", true);
                conversations.add(conv);
            }
        }
        
        // Get rides where user participated in chats (but didn't create the ride)
        List<Message> userMessages = chatService.getMessagesByUserId(userId);
        Set<Long> participatedRideIds = userMessages.stream()
            .map(msg -> msg.getRide().getId())
            .collect(Collectors.toSet());
        
        // Remove rides that user already owns (to avoid duplicates)
        participatedRideIds.removeAll(userRides.stream().map(Ride::getId).collect(Collectors.toSet()));
        
        for (Long rideId : participatedRideIds) {
            Ride ride = rideRepository.findById(rideId).orElse(null);
            if (ride != null && ride.getIsActive()) {
                // Find the last message in this conversation
                List<Message> rideMessages = messageRepository.findMessagesByRideId(rideId);
                Message lastMessage = null;
                
                // Find the most recent message in this conversation
                for (Message msg : rideMessages) {
                    if ((msg.getSender().getId().equals(userId) && msg.getReceiver().getId().equals(ride.getOwner().getId())) ||
                        (msg.getSender().getId().equals(ride.getOwner().getId()) && msg.getReceiver().getId().equals(userId))) {
                        if (lastMessage == null || msg.getCreatedAt().isAfter(lastMessage.getCreatedAt())) {
                            lastMessage = msg;
                        }
                    }
                }
                
                // Only add if there's actually a conversation (not just a self-message)
                if (lastMessage != null) {
                    // Check if this conversation has unread messages
                    boolean hasUnreadMessages = unreadRideIds.contains(rideId);
                    
                    Map<String, Object> conv = new HashMap<>();
                    conv.put("id", ride.getId());
                    conv.put("ride", Map.of(
                        "id", ride.getId(),
                        "pickup", ride.getPickup(),
                        "destination", ride.getDestination()
                    ));
                    conv.put("user", Map.of(
                        "id", ride.getOwner().getId(),
                        "name", ride.getOwner().getName(),
                        "email", ride.getOwner().getEmail()
                    ));
                    conv.put("lastMessage", lastMessage.getContent());
                    conv.put("lastMessageTime", lastMessage.getCreatedAt());
                    conv.put("hasUnreadMessages", hasUnreadMessages);
                    conv.put("isOwner", false);
                    conversations.add(conv);
                }
            }
        }
        
        return conversations;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
        }
    }

    @GetMapping("/api/chat/unread-count")
    @ResponseBody
    public Map<String, Object> getUnreadCount(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing JWT token");
        }
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, username)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
            }
            
            Long userId = jwtUtil.extractUserId(token);
            
            // Get unread messages count
            List<Message> unreadMessages = messageRepository.findUnreadMessagesForUser(userId);
            int count = unreadMessages.size();
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("hasUnread", count > 0);
            return response;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
        }
    }

    @PostMapping("/api/chat/mark-read/{rideId}")
    @ResponseBody
    public Map<String, Object> markRideAsRead(@PathVariable Long rideId, HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing JWT token");
        }
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, username)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
            }
            
            Long userId = jwtUtil.extractUserId(token);
            
            // Mark all unread messages for this ride as read
            List<Message> unreadMessages = messageRepository.findUnreadMessagesForUser(userId);
            for (Message message : unreadMessages) {
                if (message.getRide().getId().equals(rideId)) {
                    message.setIsRead(true);
                    messageRepository.save(message);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return response;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT token");
        }
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }
    
    private MessageDto convertMessageToDto(Message message) {
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

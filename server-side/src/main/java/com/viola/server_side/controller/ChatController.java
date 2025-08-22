package com.viola.server_side.controller;

import com.viola.server_side.dto.ChatMessage;
import com.viola.server_side.dto.MessageDto;
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

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        log.info("Received message: {}", chatMessage);
        
        // Save message to database
        MessageDto savedMessage = chatService.saveMessage(chatMessage);
        
        // Send to specific user if it's a private message
        if (chatMessage.getReceiverId() != null && !chatMessage.getReceiverId().isEmpty()) {
            messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiverId(),
                "/queue/messages",
                chatMessage
            );
        }
        
        return chatMessage;
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
        if (principal != null) {
            String rideId = chatMessage.getRideId().toString();
            String userId = principal.getName();
            
            // Subscribe user to ride-specific chat
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/ride." + rideId,
                chatMessage
            );
            
            log.info("User {} joined ride chat {}", userId, rideId);
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
    public List<MessageDto> getRideChatHistory(@PathVariable Long rideId) {
        return chatService.getMessagesByRideId(rideId);
    }

    @GetMapping("/api/chat/conversation/{userId}")
    public List<MessageDto> getConversationHistory(@PathVariable String userId) {
        return chatService.getConversationBetweenUsers(userId);
    }

    @GetMapping("/api/chat/unread")
    public List<MessageDto> getUnreadMessages() {
        return chatService.getUnreadMessagesForUser();
    }

    @GetMapping("/api/chat/conversations")
    public List<Map<String, Object>> getConversations() {
        // TODO: Implement actual conversation logic
        // For now, return mock data for testing
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        Map<String, Object> conv1 = new HashMap<>();
        conv1.put("id", 1L);
        conv1.put("user", Map.of(
            "id", 2L,
            "name", "John Doe",
            "email", "john@vit.ac.in"
        ));
        conv1.put("ride", Map.of(
            "id", 1L,
            "pickup", "VIT Main Gate",
            "destination", "T Nagar"
        ));
        conv1.put("lastMessage", "Hi, is this ride still available?");
        conv1.put("lastMessageTime", LocalDateTime.now().minusMinutes(30));
        conv1.put("unreadCount", 2);
        conversations.add(conv1);
        
        Map<String, Object> conv2 = new HashMap<>();
        conv2.put("id", 2L);
        conv2.put("user", Map.of(
            "id", 3L,
            "name", "Jane Smith",
            "email", "jane@vit.ac.in"
        ));
        conv2.put("ride", Map.of(
            "id", 2L,
            "pickup", "Chennai Central",
            "destination", "VIT Campus"
        ));
        conv2.put("lastMessage", "What time are you leaving?");
        conv2.put("lastMessageTime", LocalDateTime.now().minusHours(2));
        conv2.put("unreadCount", 0);
        conversations.add(conv2);
        
        return conversations;
    }
}

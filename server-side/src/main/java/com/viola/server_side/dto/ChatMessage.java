package com.viola.server_side.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String type; // "CHAT", "JOIN", "LEAVE"
    private String content;
    private String senderId;
    private String senderName;
    private String senderPhotoUrl;
    private String receiverId;
    private Long rideId;
    private LocalDateTime timestamp;
    private String sessionId;
}

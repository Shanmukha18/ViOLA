package com.viola.server_side.config;

import com.viola.server_side.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Try to get token from Authorization header first
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String jwt = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                log.info("Found JWT token in Authorization header");
            } else {
                // Try to get token from custom header (for SockJS compatibility)
                String customAuthHeader = accessor.getFirstNativeHeader("X-Authorization");
                if (customAuthHeader != null && customAuthHeader.startsWith("Bearer ")) {
                    jwt = customAuthHeader.substring(7);
                    log.info("Found JWT token in X-Authorization header");
                } else {
                    // Try to get token from session attributes (set by handshake interceptor)
                    Object sessionToken = accessor.getSessionAttributes().get("JWT_TOKEN");
                    if (sessionToken != null) {
                        jwt = sessionToken.toString();
                        log.info("Found JWT token in session attributes");
                    } else {
                        log.warn("No JWT token found in any location");
                    }
                }
            }
            
            if (jwt != null) {
                try {
                    String userEmail = jwtUtil.extractUsername(jwt);
                    Long userId = jwtUtil.extractUserId(jwt);
                    
                    if (userEmail != null && userId != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                        
                        if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                            // Use userId as the principal name for WebSocket messaging
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userId.toString(), null, userDetails.getAuthorities());
                            accessor.setUser(authToken);
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            log.info("WebSocket user authenticated: {} (userId: {})", userEmail, userId);
                        } else {
                            log.warn("Invalid JWT token for user: {}", userEmail);
                        }
                    }
                } catch (Exception e) {
                    log.warn("WebSocket authentication failed: {}", e.getMessage());
                }
            } else {
                log.warn("No Authorization header found in WebSocket connection");
            }
        }
        
        return message;
    }
}

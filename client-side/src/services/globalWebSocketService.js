import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import apiService from './apiService';

class GlobalWebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.unreadHandlers = new Set();
    }

    connect(token, onConnected, onError) {
        if (this.connected || this.stompClient) {
    
            return;
        }

        // Create SockJS URL with JWT token as query parameter
        const socketUrl = `${apiService.wsEndpoint()}?token=${encodeURIComponent(token)}`;
        const socket = new SockJS(socketUrl);
        this.stompClient = Stomp.over(socket);
        
        this.stompClient.connectHeaders = {
            'Authorization': `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`
        };

        // Configure automatic reconnection
        this.stompClient.reconnect_delay = 5000; // 5 seconds
        this.stompClient.max_reconnect_attempts = 5;

        this.stompClient.connect(
            (frame) => {
        
                this.connected = true;
                
                // Subscribe to unread notifications
                this.stompClient.subscribe('/user/queue/unread', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                
                        
                        // Notify all registered handlers
                        this.unreadHandlers.forEach(handler => {
                            try {
                                handler(data);
                            } catch (error) {
                                console.error('Error in unread handler:', error);
                            }
                        });
                    } catch (error) {
                        console.error('Error parsing unread notification:', error);
                    }
                });
                
                if (onConnected) onConnected(frame);
            },
            (error) => {
                // If this is actually a CONNECTED frame (success), handle it
                if (error && error.command === 'CONNECTED') {
            
                    this.connected = true;
                    
                    // Subscribe to unread notifications
                    this.stompClient.subscribe('/user/queue/unread', (message) => {
                        try {
                            const data = JSON.parse(message.body);
                    
                            
                            // Notify all registered handlers
                            this.unreadHandlers.forEach(handler => {
                                try {
                                    handler(data);
                                } catch (error) {
                                    console.error('Error in unread handler:', error);
                                }
                            });
                        } catch (error) {
                            console.error('Error parsing unread notification:', error);
                        }
                    });
                    
                    if (onConnected) onConnected(error);
                } else {
                    // This is an actual error
                    console.error('Global WebSocket connection error:', error);
                    this.connected = false;
                    if (onError) onError(error);
                }
            }
        );
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.connected = false;
            this.stompClient = null;
        }
    }

    // Register a handler for unread notifications
    onUnreadNotification(handler) {
        this.unreadHandlers.add(handler);
        
        // Return unsubscribe function
        return () => {
            this.unreadHandlers.delete(handler);
        };
    }

    isConnected() {
        return this.connected;
    }
}

export default new GlobalWebSocketService();

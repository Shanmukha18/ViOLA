import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class ChatService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
    }

    connect(token, onConnected, onError) {
        const socket = new SockJS('http://localhost:8081/ws');
        this.stompClient = Stomp.over(socket);
        
        // Add authentication headers
        this.stompClient.connectHeaders = {
            'Authorization': `Bearer ${token}`
        };

        this.stompClient.connect(
            (frame) => {
                // Success callback
                console.log('WebSocket CONNECTED:', frame);
                this.connected = true;
                if (onConnected) onConnected(frame);
            },
            (frame) => {
                // Check if this is actually a CONNECTED frame (success) or an error
                if (frame && frame.command === 'CONNECTED') {
                    console.log('WebSocket CONNECTED (via error callback):', frame);
                    this.connected = true;
                    if (onConnected) onConnected(frame);
                } else {
                    console.error('WebSocket connection error:', frame);
                    this.connected = false;
                    if (onError) onError(frame);
                }
            }
        );
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.connected = false;
        }
    }

    subscribeToRideChat(rideId, onMessageReceived) {
        if (!this.connected || !this.stompClient) {
            console.error('WebSocket not connected');
            return null;
        }

        const subscription = this.stompClient.subscribe(
            `/topic/ride.${rideId}`,
            (message) => {
                const chatMessage = JSON.parse(message.body);
                if (onMessageReceived) onMessageReceived(chatMessage);
            }
        );

        this.subscriptions.set(`ride.${rideId}`, subscription);
        return subscription;
    }

    subscribeToPrivateMessages(onMessageReceived) {
        if (!this.connected || !this.stompClient) {
            console.error('WebSocket not connected');
            return null;
        }

        const subscription = this.stompClient.subscribe(
            '/user/queue/private',
            (message) => {
                const chatMessage = JSON.parse(message.body);
                if (onMessageReceived) onMessageReceived(chatMessage);
            }
        );

        this.subscriptions.set('private', subscription);
        return subscription;
    }

    sendMessage(content, senderId, receiverId, rideId) {
        if (!this.connected || !this.stompClient) {
            console.error('WebSocket not connected');
            return false;
        }

        const chatMessage = {
            type: 'CHAT',
            content: content,
            senderId: senderId,
            receiverId: receiverId,
            rideId: rideId,
            timestamp: new Date().toISOString()
        };

        this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        return true;
    }

    sendPrivateMessage(content, senderId, receiverId) {
        if (!this.connected || !this.stompClient) {
            console.error('WebSocket not connected');
            return false;
        }

        const chatMessage = {
            type: 'CHAT',
            content: content,
            senderId: senderId,
            receiverId: receiverId,
            timestamp: new Date().toISOString()
        };

        this.stompClient.send('/app/chat.private', {}, JSON.stringify(chatMessage));
        return true;
    }

    joinRideChat(rideId, userId) {
        if (!this.connected || !this.stompClient) {
            console.error('WebSocket not connected');
            return false;
        }

        const joinMessage = {
            type: 'JOIN',
            rideId: rideId,
            senderId: userId,
            timestamp: new Date().toISOString()
        };

        this.stompClient.send('/app/chat.joinRide', {}, JSON.stringify(joinMessage));
        return true;
    }

    unsubscribeFromRideChat(rideId) {
        const subscription = this.subscriptions.get(`ride.${rideId}`);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(`ride.${rideId}`);
        }
    }

    unsubscribeFromPrivateMessages() {
        const subscription = this.subscriptions.get('private');
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete('private');
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new ChatService();

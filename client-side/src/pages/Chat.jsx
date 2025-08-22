import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Send, MessageCircle, User, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import chatService from '../services/chatService';

const Chat = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Generate a unique session ID for this browser instance
  const sessionId = useRef(Math.random().toString(36).substr(2, 9)).current;

  // WebSocket connection management
  useEffect(() => {
    if (token && user) {
      connectToWebSocket();
    }
    
    return () => {
      chatService.disconnect();
    };
  }, [token, user]);

  const connectToWebSocket = () => {
    if (!token) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    chatService.connect(
      token,
      () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('WebSocket connected successfully');
      },
      (error) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError('Failed to connect to chat server');
        console.error('WebSocket connection failed:', error);
      }
    );
  };

  const disconnectFromWebSocket = () => {
    chatService.disconnect();
    setIsConnected(false);
    setConnectionError(null);
  };

  // Handle ride context from navigation
  useEffect(() => {
    if (location.state?.rideId && location.state?.rideOwner) {
      // Create a conversation for this ride
      const rideConversation = {
        id: Date.now(),
        user: location.state.rideOwner,
        ride: {
          id: location.state.rideId,
          pickup: 'From Ride Card', // You can enhance this
          destination: 'To Ride Card'
        },
        lastMessage: 'Start chatting about this ride!',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      
      setConversations([rideConversation]);
      setSelectedConversation(rideConversation);
    }
  }, [location.state]);

  // Load conversations from API (you'll need to implement this endpoint)
  useEffect(() => {
    if (isConnected && !location.state?.rideId) {
      loadConversations();
    }
  }, [isConnected, location.state]);

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation && isConnected) {
      loadMessages(selectedConversation.ride.id);
      // Subscribe to ride chat
      chatService.subscribeToRideChat(selectedConversation.ride.id, handleNewMessage);
      // Join the ride chat
      chatService.joinRideChat(selectedConversation.ride.id, user.id.toString());
    }
    
    return () => {
      if (selectedConversation) {
        chatService.unsubscribeFromRideChat(selectedConversation.ride.id);
      }
    };
  }, [selectedConversation, isConnected]);

  const loadMessages = async (rideId) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`http://localhost:8081/api/chat/ride/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewMessage = (message) => {
    console.log(`[Session ${sessionId}] Received new message:`, message);
    
    // Check if this message is from the current user
    const isFromCurrentUser = message.senderId === user.id.toString();
    
    setMessages(prev => {
      // Remove any optimistic messages with the same content from current user
      const filteredMessages = isFromCurrentUser 
        ? prev.filter(msg => !msg.isOptimistic || msg.content !== message.content)
        : prev;
      
      // Check if this message already exists - use a more specific comparison
      const messageExists = filteredMessages.some(msg => {
        // If both messages have IDs, compare by ID
        if (msg.id && message.id && msg.id === message.id) {
          return true;
        }
        
        // If both messages have the same content, sender, and timestamp (within 5 seconds), consider it a duplicate
        const contentMatch = msg.content === message.content;
        const senderMatch = (msg.senderId === message.senderId) || 
                           (msg.sender && msg.sender.id && msg.sender.id.toString() === message.senderId);
        
        if (contentMatch && senderMatch) {
          const msgTime = new Date(msg.timestamp || msg.createdAt).getTime();
          const newMsgTime = new Date(message.timestamp).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);
          
          // If messages are within 5 seconds of each other, consider it a duplicate
          if (timeDiff < 5000) {
            return true;
          }
        }
        
        return false;
      });
      
      if (!messageExists) {
        // Add the new message
        const newMessage = {
          ...message,
          timestamp: new Date(message.timestamp || Date.now())
        };
        console.log(`[Session ${sessionId}] Adding new message to UI:`, newMessage);
        return [...filteredMessages, newMessage];
      }
      
      console.log(`[Session ${sessionId}] Message already exists, not adding duplicate`);
      return filteredMessages;
    });
    
    // Update conversation last message
    if (selectedConversation && message.rideId === selectedConversation.ride.id) {
      setConversations(prev => prev.map(conv => 
        conv.ride.id === message.rideId 
          ? { ...conv, lastMessage: message.content, lastMessageTime: new Date(message.timestamp || Date.now()) }
          : conv
      ));
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !isConnected) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Send message via WebSocket
    const success = chatService.sendMessage(
      messageContent,
      user.id.toString(),
      selectedConversation.user.id.toString(),
      selectedConversation.ride.id
    );

    if (!success) {
      alert('Failed to send message. Please check your connection.');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return 'Today';
    } else if (today.getDate() - messageDate.getDate() === 1) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Connection Status */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <div className="flex items-center space-x-2">
              {isConnecting && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm">Connecting...</span>
                </div>
              )}
              {isConnected && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
              )}
              {!isConnected && !isConnecting && (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isConnected && !isConnecting && (
              <button
                onClick={connectToWebSocket}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reconnect
              </button>
            )}
            {isConnected && (
              <button
                onClick={disconnectFromWebSocket}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
        
        {connectionError && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.user.name}
                            </h3>
                            {conversation.isOwner && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Your Ride
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.ride.pickup} → {conversation.ride.destination}
                        </p>
                        <p className="text-sm text-gray-700 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {isConnected ? (
                    <div>
                      <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs">Start chatting about rides!</p>
                    </div>
                  ) : (
                    <div>
                      <WifiOff className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">Not connected to chat</p>
                      <p className="text-xs">Connect to start messaging</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedConversation.user.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.ride.pickup} → {selectedConversation.ride.destination}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      // Check if this message is from the current user
                      // Handle both ChatMessage (senderId string) and MessageDto (sender object) structures
                      let messageSenderId;
                      if (message.senderId) {
                        // ChatMessage structure (WebSocket)
                        messageSenderId = message.senderId;
                      } else if (message.sender && message.sender.id) {
                        // MessageDto structure (API)
                        messageSenderId = message.sender.id.toString();
                      } else {
                        // Fallback
                        messageSenderId = null;
                      }
                      
                      const currentUserIdString = user.id.toString();
                      const isOwnMessage = messageSenderId === currentUserIdString;
                      
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                      return (
                        <div key={`${message.id || 'temp'}-${messageSenderId || 'unknown'}-${index}-${message.timestamp}`}>
                          {showDate && (
                            <div className="text-center mb-4">
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-900 border border-gray-200'
                            } ${message.isOptimistic ? 'opacity-70' : ''}`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                                {message.isOptimistic && ' (sending...)'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={isConnected ? "Type your message..." : "Connect to chat..."}
                      disabled={!isConnected}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Connect to WebSocket to send messages
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

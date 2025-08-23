import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUnread } from '../contexts/UnreadContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLocation } from 'react-router-dom';
import { Send, MessageCircle, User, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import chatService from '../services/chatService';

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f1f5f9;
  }
  .force-scrollbar {
    overflow-y: scroll !important;
  }
  .chat-container {
    height: 100%;
    overflow: hidden;
  }
  .chat-messages {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

const Chat = () => {
  const { user, token } = useAuth();
  const { markConversationAsRead, isConversationUnread, addUnreadConversation, setUnreadState } = useUnread();
  const { showError, showInfo } = useNotification();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  
  // Generate a unique session ID for this browser instance
  const sessionId = useRef(Math.random().toString(36).substr(2, 9)).current;

  // Utility function to normalize timestamps
  const normalizeTimestamp = (date) => {
    if (!date) return new Date();
    
    try {
      // Handle both ISO string and Date object
      return typeof date === 'string' ? new Date(date) : date;
    } catch (error) {
      console.error('Error normalizing timestamp:', error);
      return new Date();
    }
  };

  // WebSocket connection management
  useEffect(() => {
    if (token && user) {
      connectToWebSocket();
    }
    
    return () => {
      chatService.disconnect();
    };
  }, [token, user]);

  // Automatic reconnection
  useEffect(() => {
    let reconnectTimer;
    
    if (!isConnected && !isConnecting && token && user) {
      // Wait 3 seconds before attempting to reconnect
      reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectToWebSocket();
      }, 3000);
    }
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [isConnected, isConnecting, token, user]);

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



  // Handle ride context from navigation
  useEffect(() => {
    if (location.state?.rideId && location.state?.rideOwner) {
      // Fetch the actual ride details to get pickup and destination
      const fetchRideDetails = async () => {
        try {
          const response = await fetch(`http://localhost:8081/api/rides/${location.state.rideId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const rideData = await response.json();
            
            // Check if ride is active
            if (!rideData.isActive) {
              console.error('Ride is not active');
              createFallbackConversation('Ride not available');
              return;
            }
            
            // Create a conversation for this ride with actual details
            const rideConversation = {
              id: Date.now(),
              user: location.state.rideOwner,
              ride: {
                id: location.state.rideId,
                pickup: rideData.pickup,
                destination: rideData.destination
              },
              lastMessage: 'Start chatting about this ride!',
              lastMessageTime: new Date(),
              unreadCount: 0
            };
            
            setConversations([rideConversation]);
            setSelectedConversation(rideConversation);
          } else {
            console.error('Failed to fetch ride details');
            // Fallback to placeholder if API fails
            createFallbackConversation('Ride not found');
          }
        } catch (error) {
          console.error('Error fetching ride details:', error);
          // Fallback to placeholder if API fails
          createFallbackConversation('Error loading ride');
        }
      };
      
      const createFallbackConversation = (errorMessage = 'Loading...') => {
        const rideConversation = {
          id: Date.now(),
          user: location.state.rideOwner,
          ride: {
            id: location.state.rideId,
            pickup: errorMessage,
            destination: errorMessage
          },
          lastMessage: 'Start chatting about this ride!',
          lastMessageTime: new Date(),
          unreadCount: 0
        };
        
        setConversations([rideConversation]);
        setSelectedConversation(rideConversation);
      };
      
      fetchRideDetails();
    }
  }, [location.state, token]);

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
        
        // Set unread state based on loaded conversations
        setUnreadState(data);
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
      console.log(`[Session ${sessionId}] Loading messages for ride ${rideId}`);
      const response = await fetch(`http://localhost:8081/api/chat/ride/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[Session ${sessionId}] Loaded ${data.length} messages from API:`, data);
        setMessages(data);
      } else {
        console.error(`[Session ${sessionId}] Failed to load messages:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`[Session ${sessionId}] Failed to load messages:`, error);
    } finally {
      setIsLoadingMessages(false);
    }
  };



  const handleNewMessage = (message) => {
    console.log(`[Session ${sessionId}] Received new message:`, message);
    
    // Check if this message is from the current user
    const isFromCurrentUser = message.senderId === user.id.toString();
    
    // If message is from another user and either no conversation is selected or it's not the currently selected conversation, mark as unread
    if (!isFromCurrentUser && (!selectedConversation || message.rideId !== selectedConversation.ride.id)) {
      console.log('Marking message as unread:', message);
      // Find the conversation for this ride and mark it as unread
      setConversations(prev => prev.map(conv => {
        if (conv.ride.id === message.rideId) {
          console.log('Updating conversation unread status for ride:', conv.ride.id);
          return { ...conv, hasUnreadMessages: true };
        }
        return conv;
      }));
      
      // Add to unread conversations set
      const conversationId = conversations.find(conv => conv.ride.id === message.rideId)?.id;
      if (conversationId) {
        addUnreadConversation(conversationId);
      }
    }
    
    setMessages(prev => {
      // Remove any optimistic messages with the same content from current user
      const filteredMessages = isFromCurrentUser 
        ? prev.filter(msg => !msg.isOptimistic || msg.content !== message.content)
        : prev;
      
      // Check if this message already exists - use a more specific comparison
      const messageExists = filteredMessages.some(msg => {
        // If both messages have IDs, compare by ID
        if (msg.id && message.id && msg.id === message.id) {
          console.log(`[Session ${sessionId}] Message exists by ID: ${msg.id}`);
          return true;
        }
        
        // If both messages have the same content, sender, and timestamp (within 2 seconds), consider it a duplicate
        const contentMatch = msg.content === message.content;
        const senderMatch = (msg.senderId === message.senderId) || 
                           (msg.sender && msg.sender.id && msg.sender.id.toString() === message.senderId);
        
        if (contentMatch && senderMatch) {
          // Get timestamp from either createdAt or timestamp field
          const msgTime = new Date(msg.createdAt || msg.timestamp || Date.now()).getTime();
          const newMsgTime = new Date(message.createdAt || message.timestamp || Date.now()).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);
          
          // If messages are within 2 seconds of each other, consider it a duplicate
          if (timeDiff < 2000) {
            console.log(`[Session ${sessionId}] Message exists by content/sender/time: content="${msg.content}", sender="${msg.senderId}", timeDiff=${timeDiff}ms`);
            return true;
          }
        }
        
        return false;
      });
      
      if (!messageExists) {
        // Add the new message with consistent timestamp handling
        const newMessage = {
          ...message,
          // Use createdAt if available (from API), otherwise use timestamp (from WebSocket)
          timestamp: message.createdAt || message.timestamp || new Date(),
          createdAt: message.createdAt || message.timestamp || new Date()
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
          ? { 
              ...conv, 
              lastMessage: message.content, 
              lastMessageTime: message.createdAt || message.timestamp || new Date() 
            }
          : conv
      ));
    }
  };



  const scrollToBottomButton = () => {
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read when selected
    if (isConversationUnread(conversation.id)) {
      markConversationAsRead(conversation.id);
    }
    
    // Call backend to mark messages as read
    if (conversation.hasUnreadMessages) {
      try {
        await fetch(`http://localhost:8081/api/chat/mark-read/${conversation.ride.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Reset unread status for this conversation
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversation.id && conv.hasUnreadMessages) {
            return { ...conv, hasUnreadMessages: false };
          }
          return conv;
        }));
        
        // Mark conversation as read in unread context
        markConversationAsRead(conversation.id);
      } catch (error) {
        console.error('Failed to mark conversation as read:', error);
      }
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !isConnected) return;

    // Prevent self-chatting
    if (user.id === selectedConversation.user.id) {
      showInfo('You cannot send messages to yourself.');
      return;
    }

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
      showError('Failed to send message. Please check your connection.');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = normalizeTimestamp(date);
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const messageDate = normalizeTimestamp(date);
      const today = new Date();
      
      // Reset time to compare only dates
      const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = todayOnly.getTime() - messageDateOnly.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return messageDate.toLocaleDateString([], { weekday: 'long' });
      } else {
        return messageDate.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <style>{scrollbarStyles}</style>
             {/* Chat Header with Connection Status */}
       <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
         <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
           
           {/* Connection Status Indicator */}
           <div className="flex items-center space-x-2">
             {isConnecting && (
               <div className="flex items-center space-x-1 text-yellow-600">
                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                 <span className="text-xs">Connecting...</span>
               </div>
             )}
             {isConnected && (
               <div className="flex items-center space-x-1 text-green-600">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <span className="text-xs">Connected</span>
               </div>
             )}
             {!isConnected && !isConnecting && (
               <div className="flex items-center space-x-1 text-red-600">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                 <span className="text-xs">Reconnecting...</span>
               </div>
             )}
           </div>
         </div>
         
         {connectionError && (
           <div className="mt-2 flex items-center space-x-2 text-red-600">
             <AlertCircle className="h-4 w-4" />
             <span className="text-sm">Connection lost. Reconnecting automatically...</span>
           </div>
         )}
       </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden h-[700px]">
        <div 
          className="grid grid-cols-1 md:grid-cols-3 h-full"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Conversations List */}
          <div className="border-r border-gray-200 bg-gray-50 flex flex-col">
                         <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
               <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
             </div>
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar force-scrollbar"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {conversations.length > 0 ? (
                                                 conversations.map((conversation) => {
                  const isUnread = conversation.hasUnreadMessages;
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    >
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                                                                         <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${
                            isUnread ? 'font-bold text-gray-900' : 'text-gray-900'
                          }`}>
                            {conversation.user.name}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                         {conversation.isOwner && (
                           <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                             Your Ride
                           </span>
                         )}
                                                 
                       </div>
                     </div>
                   </div>
                 );
               })
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
           <div className="md:col-span-2 flex flex-col chat-container">
            {selectedConversation ? (
              <>
                                 {/* Chat Header - Fixed at top */}
                 <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                   <div className="flex items-center space-x-3">
                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                       <User className="h-5 w-5 text-blue-600" />
                     </div>
                     <div className="flex-1">
                       <h3 className="text-lg font-semibold text-gray-900">
                         {selectedConversation.user.name}
                       </h3>
                       <p className="text-sm text-gray-500">
                         {selectedConversation.ride.pickup} → {selectedConversation.ride.destination}
                       </p>
                     </div>
                                           <div className="flex items-center space-x-2">
                        {selectedConversation.isOwner && (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                            Your Ride
                          </span>
                        )}
                        <button
                          onClick={scrollToBottomButton}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          title="Scroll to bottom"
                        >
                          ↓
                        </button>
                      </div>
                   </div>
                 </div>

                                 {/* Messages - Scrollable area */}
                 <div 
                   className="flex-1 p-4 space-y-4 bg-gray-50 custom-scrollbar force-scrollbar chat-messages"
                   onWheel={(e) => {
                     e.stopPropagation();
                   }}
                 >
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
                        formatDate(message.createdAt || message.timestamp) !== formatDate(messages[index - 1].createdAt || messages[index - 1].timestamp);

                      return (
                        <div key={`${message.id || 'temp'}-${messageSenderId || 'unknown'}-${index}-${message.createdAt || message.timestamp}`}>
                          {showDate && (
                            <div className="text-center mb-4">
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {formatDate(message.createdAt || message.timestamp)}
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
                                {formatTime(message.createdAt || message.timestamp)}
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
                  
                </div>

                {/* Message Input - Fixed at bottom */}
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

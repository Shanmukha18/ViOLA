import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import globalWebSocketService from '../services/globalWebSocketService';

const UnreadContext = createContext();

export const useUnread = () => {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within an UnreadProvider');
  }
  return context;
};

export const UnreadProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState(new Set());

  // Mark conversation as read
  const markConversationAsRead = (conversationId) => {
    setUnreadConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      const hasUnread = newSet.size > 0;
      setHasUnreadMessages(hasUnread);
      return newSet;
    });
  };

  // Add unread conversation (called when new message arrives)
  const addUnreadConversation = (conversationId) => {
    setUnreadConversations(prev => {
      const newSet = new Set(prev);
      newSet.add(conversationId);
      setHasUnreadMessages(true); // Set to true when any unread message exists
      return newSet;
    });
  };

  // Check if conversation is unread
  const isConversationUnread = (conversationId) => {
    return unreadConversations.has(conversationId);
  };

  // Initialize unread state when user changes
  useEffect(() => {
    if (user && token) {
      // Reset state for new user
      setHasUnreadMessages(false);
      setUnreadConversations(new Set());
      
      // Connect to global WebSocket for unread notifications
      try {
        globalWebSocketService.connect(
          token,
          () => {
    
          },
          (error) => {
            console.error('Global WebSocket connection failed:', error);
          }
        );
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
      }
    } else {
      setHasUnreadMessages(false);
      setUnreadConversations(new Set());
      globalWebSocketService.disconnect();
    }
  }, [user, token]);

  // Subscribe to unread notifications
  useEffect(() => {
    if (user && token) {
      const unsubscribe = globalWebSocketService.onUnreadNotification((data) => {

        
        if (data.conversationId) {
          addUnreadConversation(data.conversationId);
        } else if (data.rideId) {
          // If we don't have conversation ID but have rideId, 
          // we'll mark it as unread and the conversation will be updated when chat page loads
          setHasUnreadMessages(true);
        }
      });

      return unsubscribe;
    }
  }, [user, token]);

  // Function to manually set unread state (called from Chat page when loading conversations)
  const setUnreadState = (conversations) => {
    const unreadIds = new Set();
    let hasUnread = false;
    
    conversations.forEach(conv => {
      if (conv.hasUnreadMessages) {
        unreadIds.add(conv.id);
        hasUnread = true;
      }
    });
    
    setUnreadConversations(unreadIds);
    setHasUnreadMessages(hasUnread);
  };

  const value = {
    hasUnreadMessages, // Boolean instead of count
    unreadConversations,
    markConversationAsRead,
    addUnreadConversation,
    isConversationUnread,
    setUnreadState
  };

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  );
};

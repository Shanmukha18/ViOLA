import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(new Set());

  // Fetch unread count from backend
  const fetchUnreadCount = async () => {
    if (!token || !user) return;
    
    try {
      console.log('Fetching unread count for user:', user.email);
      const response = await fetch('http://localhost:8081/api/chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Unread count response:', data);
        // Just set to 1 if there are any unread messages, 0 otherwise
        setUnreadCount(data.hasUnread ? 1 : 0);
      } else {
        console.error('Failed to fetch unread count, status:', response.status);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Set to 0 if there's an error
      setUnreadCount(0);
    }
  };

  // Mark conversation as read
  const markConversationAsRead = (conversationId) => {
    setUnreadConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
    
    // Update total count - just check if there are any unread conversations left
    setUnreadCount(prev => {
      const newSet = new Set(unreadConversations);
      newSet.delete(conversationId);
      return newSet.size;
    });
  };

  // Add unread conversation
  const addUnreadConversation = (conversationId) => {
    setUnreadConversations(prev => {
      const newSet = new Set(prev);
      newSet.add(conversationId);
      return newSet;
    });
    
    setUnreadCount(prev => {
      const newSet = new Set(unreadConversations);
      newSet.add(conversationId);
      return newSet.size;
    });
  };

  // Check if conversation is unread
  const isConversationUnread = (conversationId) => {
    return unreadConversations.has(conversationId);
  };

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setUnreadConversations(new Set());
    }
  }, [user, token]);

  // Expose a function to manually refresh unread count
  const refreshUnreadCount = () => {
    if (user && token) {
      fetchUnreadCount();
    }
  };

  const value = {
    unreadCount,
    unreadConversations,
    markConversationAsRead,
    addUnreadConversation,
    isConversationUnread,
    fetchUnreadCount,
    setUnreadCount,
    refreshUnreadCount
  };

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  );
};

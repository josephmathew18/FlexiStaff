import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth() || {};

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'projects'
  const [searchQuery, setSearchQuery] = useState('');

  const activeIdRef = useRef(activeConversationId);
  activeIdRef.current = activeConversationId;

  const previousUnreadRef = useRef(0);

  // 1. Fetch Conversations
  const refreshConversations = useCallback(async (silent = false) => {
    if (!isAuthenticated || !authUser) return;
    if (!silent) setLoading(true);
    try {
      const res = await api.chat.getConversations();
      if (res && res.success && Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.warn('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  // 2. Fetch Eligible Contacts
  const refreshContacts = useCallback(async () => {
    if (!isAuthenticated || !authUser) return;
    try {
      const res = await api.chat.getContacts();
      if (res && res.success && Array.isArray(res.data)) {
        setContacts(res.data);
      }
    } catch (err) {
      console.warn('Error fetching eligible contacts:', err);
    }
  }, [isAuthenticated, authUser]);

  // 3. Fetch Unread Count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !authUser) return;
    try {
      const res = await api.chat.getUnreadCount();
      if (res && res.success && res.data && typeof res.data.unreadCount === 'number') {
        const newCount = res.data.unreadCount;
        if (newCount > previousUnreadRef.current && previousUnreadRef.current !== 0) {
          // Play subtle tone or trigger notification
        }
        previousUnreadRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.warn('Error fetching unread count:', err);
    }
  }, [isAuthenticated, authUser]);

  // 4. Fetch Messages for Active Conversation
  const refreshMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) return;
    if (!silent) setMessagesLoading(true);
    try {
      const res = await api.chat.getMessages(conversationId);
      if (res && res.success && Array.isArray(res.data)) {
        setMessages(res.data);
        // Once opened, local unread count for this conversation goes to 0
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
        refreshUnreadCount();
      }
    } catch (err) {
      console.warn('Error fetching conversation messages:', err);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, [refreshUnreadCount]);

  // 5. Select Active Conversation
  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
    if (convId) {
      refreshMessages(convId, false);
      api.chat.markAsRead(convId).catch(() => {});
    } else {
      setMessages([]);
    }
  }, [refreshMessages]);

  // 6. Open or Create Conversation with a recipient (e.g. from contextual button)
  const openConversationWith = useCallback(
    async ({ recipientUserId, projectId, initialMessage, recipientUser }) => {
      if (!recipientUserId) return null;
      try {
        setLoading(true);
        const res = await api.chat.createConversation({
          recipientUserId,
          projectId: projectId || null,
          initialMessage: initialMessage || '',
        });

        if (res && res.success && res.data) {
          const newConv = res.data;
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === newConv.id);
            if (exists) {
              return prev.map((c) => (c.id === newConv.id ? newConv : c));
            }
            return [newConv, ...prev];
          });
          selectConversation(newConv.id);
          return newConv;
        } else {
          toast.error(res?.error || 'Unable to open conversation with this contact.');
        }
      } catch (err) {
        console.error('Failed to open conversation:', err);
        toast.error('Network error opening conversation.');
      } finally {
        setLoading(false);
      }
      return null;
    },
    [selectConversation]
  );

  // 7. Send a Message
  const sendMessage = useCallback(
    async (payload) => {
      const convId = activeIdRef.current;
      if (!convId) return null;

      try {
        const res = await api.chat.sendMessage(convId, payload);
        if (res && res.success && res.data) {
          const sentMsg = res.data;
          setMessages((prev) => [...prev, sentMsg]);

          // Update conversation in sidebar
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    lastMessage: sentMsg.content || `📎 ${sentMsg.attachmentName || 'Attachment'}`,
                    lastMessageTime: sentMsg.createdAt || new Date().toISOString(),
                    lastSenderName: 'You',
                  }
                : c
            )
          );
          return sentMsg;
        } else {
          toast.error(res?.error || 'Failed to send message.');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        toast.error('Could not send message.');
      }
      return null;
    },
    []
  );

  // 8. Upload File Attachment
  const uploadAttachment = useCallback(async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.chat.uploadAttachment(formData);
      if (res && res.success && res.data) {
        return res.data;
      } else {
        toast.error(res?.error || 'File upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('File upload failed');
    }
    return null;
  }, []);

  // Initialize data on mount or auth change
  useEffect(() => {
    if (isAuthenticated && authUser) {
      refreshConversations();
      refreshContacts();
      refreshUnreadCount();
    } else {
      setConversations([]);
      setMessages([]);
      setContacts([]);
      setActiveConversationId(null);
      setUnreadCount(0);
    }
  }, [isAuthenticated, authUser, refreshConversations, refreshContacts, refreshUnreadCount]);

  // Real-time synchronization: resilient background polling loop (every 4 seconds)
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    const intervalId = setInterval(() => {
      // 1. Poll unread count
      refreshUnreadCount();

      // 2. Poll conversation list
      refreshConversations(true);

      // 3. If there is an active conversation, poll latest messages
      if (activeIdRef.current) {
        refreshMessages(activeIdRef.current, true);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, authUser, refreshUnreadCount, refreshConversations, refreshMessages]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        contacts,
        unreadCount,
        loading,
        messagesLoading,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        selectConversation,
        openConversationWith,
        sendMessage,
        uploadAttachment,
        refreshConversations,
        refreshContacts,
        refreshUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;

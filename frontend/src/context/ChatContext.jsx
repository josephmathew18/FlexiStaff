import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { getWsBaseUrl } from '../services/apiConfig';
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
  const stompClientRef = useRef(null);
  const convSubRef = useRef(null);
  const notifSubRef = useRef(null);

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
        previousUnreadRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.warn('Error fetching unread count:', err);
    }
  }, [isAuthenticated, authUser]);

  // Helper to map and sanitize a message object
  const mapMessage = useCallback((m) => {
    const currentUserId = authUser?.id;
    const isMine = Boolean(
      m.isMine ||
      (currentUserId && m.senderId && Number(m.senderId) === Number(currentUserId))
    );
    return {
      ...m,
      isMine,
    };
  }, [authUser?.id]);

  // 4. Fetch Messages for Active Conversation
  const refreshMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) return;
    if (!silent) setMessagesLoading(true);
    try {
      const res = await api.chat.getMessages(conversationId);
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapMessage);

        setMessages((prev) => {
          // Preserve any in-flight optimistic temporary messages
          const pendingTemp = prev.filter((p) => p.isTemp && p.status === 'SENDING');
          if (pendingTemp.length === 0) {
            return mapped;
          }
          const merged = [...mapped];
          pendingTemp.forEach((t) => {
            const alreadyThere = mapped.some((m) => m.content === t.content && m.isMine);
            if (!alreadyThere) merged.push(t);
          });
          return merged;
        });

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
  }, [mapMessage, refreshUnreadCount]);

  // Handle incoming real-time message from STOMP WebSocket
  const handleIncomingMessage = useCallback((incomingRaw) => {
    if (!incomingRaw) return;
    const formatted = mapMessage(incomingRaw);
    const convId = formatted.conversationId;

    // 1. If currently in this conversation, append immediately to messages
    if (activeIdRef.current && Number(activeIdRef.current) === Number(convId)) {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === formatted.id)) {
          return prev;
        }

        // Reconcile with any temporary optimistic message
        if (formatted.isMine) {
          const tempIdx = prev.findIndex(
            (m) => m.isTemp && m.content === formatted.content
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = formatted;
            return updated;
          }
        }

        return [...prev, formatted];
      });

      // Automatically mark as read if not sent by me
      if (!formatted.isMine) {
        api.chat.markAsRead(convId).catch(() => {});
      }
    }

    // 2. Instantly update conversation snippet in sidebar
    setConversations((prev) => {
      const found = prev.some((c) => Number(c.id) === Number(convId));
      if (!found) {
        // Conversation not in list yet, refresh full list
        refreshConversations(true);
        return prev;
      }

      return prev.map((c) =>
        Number(c.id) === Number(convId)
          ? {
              ...c,
              lastMessage: formatted.content || `📎 ${formatted.attachmentName || 'Attachment'}`,
              lastMessageTime: formatted.createdAt || new Date().toISOString(),
              lastSenderName: formatted.isMine ? 'You' : (formatted.senderName || 'Sender'),
              unreadCount:
                activeIdRef.current && Number(activeIdRef.current) === Number(convId)
                  ? 0
                  : (c.unreadCount || 0) + (formatted.isMine ? 0 : 1),
            }
          : c
      );
    });

    refreshUnreadCount();
  }, [mapMessage, refreshConversations, refreshUnreadCount]);

  // Subscribe STOMP client to active conversation
  const subscribeToConversation = useCallback((client, convId) => {
    if (!client || !client.connected || !convId) return;

    if (convSubRef.current) {
      try { convSubRef.current.unsubscribe(); } catch {}
      convSubRef.current = null;
    }

    try {
      convSubRef.current = client.subscribe(`/topic/conversation/${convId}`, (message) => {
        try {
          const incoming = JSON.parse(message.body);
          handleIncomingMessage(incoming);
        } catch (err) {
          console.warn('[STOMP] Error parsing message payload:', err);
        }
      });
      console.log(`[STOMP] Subscribed to /topic/conversation/${convId}`);
    } catch (err) {
      console.warn('[STOMP] Subscription failed:', err);
    }
  }, [handleIncomingMessage]);

  // STOMP WebSocket Connection Management
  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) {
      if (stompClientRef.current) {
        try { stompClientRef.current.deactivate(); } catch {}
        stompClientRef.current = null;
      }
      return;
    }

    const wsUrl = getWsBaseUrl();
    const token = localStorage.getItem('flexistaff_token');

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 1500, // Fast reconnect (1.5s)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('[STOMP] Connected to real-time WebSocket:', wsUrl);

        // 1. Subscribe to user notifications (for direct messages across all conversations)
        if (authUser?.id) {
          notifSubRef.current = client.subscribe(
            `/topic/user/${authUser.id}/notifications`,
            (message) => {
              try {
                const notif = JSON.parse(message.body);
                handleIncomingMessage(notif);
              } catch (err) {
                console.warn('[STOMP] Error parsing user notification:', err);
              }
            }
          );
        }

        // 2. If an active conversation is open, subscribe immediately
        if (activeIdRef.current) {
          subscribeToConversation(client, activeIdRef.current);
        }
      },
      onStompError: (frame) => {
        console.warn('[STOMP] Protocol error:', frame.headers['message']);
      },
      onWebSocketError: (err) => {
        console.warn('[STOMP] WebSocket transport error (active polling fallback engaged):', err);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (convSubRef.current) {
        try { convSubRef.current.unsubscribe(); } catch {}
        convSubRef.current = null;
      }
      if (notifSubRef.current) {
        try { notifSubRef.current.unsubscribe(); } catch {}
        notifSubRef.current = null;
      }
      try { client.deactivate(); } catch {}
      stompClientRef.current = null;
    };
  }, [isAuthenticated, authUser?.id, handleIncomingMessage, subscribeToConversation]);

  // Dynamic conversation STOMP subscription on activeConversationId change
  useEffect(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      if (activeConversationId) {
        subscribeToConversation(stompClientRef.current, activeConversationId);
      } else if (convSubRef.current) {
        try { convSubRef.current.unsubscribe(); } catch {}
        convSubRef.current = null;
      }
    }
  }, [activeConversationId, subscribeToConversation]);

  // 5. Select Active Conversation
  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
    if (convId) {
      refreshMessages(convId, false);
      api.chat.markAsRead(convId).catch(() => {});
      if (stompClientRef.current && stompClientRef.current.connected) {
        subscribeToConversation(stompClientRef.current, convId);
      }
    } else {
      setMessages([]);
    }
  }, [refreshMessages, subscribeToConversation]);

  // 6. Open or Create Conversation with a recipient or Project Group
  const openConversationWith = useCallback(
    async ({ recipientUserId, projectId, isGroup, initialMessage, recipientUser }) => {
      if (!recipientUserId && !projectId) return null;
      try {
        setLoading(true);
        const res = await api.chat.createConversation({
          recipientUserId: recipientUserId || null,
          projectId: projectId || null,
          isGroup: isGroup ?? (!recipientUserId && !!projectId),
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

  // 7. Send a Message (with Optimistic Instant UI Delivery)
  const sendMessage = useCallback(
    async (payload) => {
      const convId = activeIdRef.current;
      if (!convId) return null;

      const currentUserId = authUser?.id;
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const tempMsg = {
        id: tempId,
        isTemp: true,
        conversationId: convId,
        senderId: currentUserId,
        senderName: authUser?.name || authUser?.fullName || 'You',
        senderRole: authUser?.role,
        content: payload.content || '',
        messageType: payload.messageType || 'TEXT',
        attachmentUrl: payload.attachmentUrl,
        attachmentName: payload.attachmentName,
        attachmentSize: payload.attachmentSize,
        attachmentType: payload.attachmentType,
        createdAt: new Date().toISOString(),
        isMine: true,
        sentByMe: true,
        status: 'SENDING',
      };

      // 1. OPTIMISTIC INSTANT RENDER (0ms latency for sender!)
      setMessages((prev) => [...prev, tempMsg]);

      // 2. Instantly update conversation snippet in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(convId)
            ? {
                ...c,
                lastMessage: payload.content || `📎 ${payload.attachmentName || 'Attachment'}`,
                lastMessageTime: new Date().toISOString(),
                lastSenderName: 'You',
              }
            : c
        )
      );

      // 3. Dispatch to API
      try {
        const res = await api.chat.sendMessage(convId, payload);
        if (res && res.success && res.data) {
          const sentMsg = {
            ...res.data,
            isMine: true,
          };

          // Reconcile temp message with real server message
          setMessages((prev) => {
            const alreadyExists = prev.some((m) => m.id === sentMsg.id);
            if (alreadyExists) {
              return prev.filter((m) => m.id !== tempId);
            }
            return prev.map((m) => (m.id === tempId ? sentMsg : m));
          });

          refreshConversations(true);
          return sentMsg;
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m))
          );
          toast.error(res?.error || 'Failed to send message.');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m))
        );
        toast.error('Could not send message.');
      }
      return null;
    },
    [authUser, refreshConversations]
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

  // Ultra-Fast Real-Time Synchronization Loop & Focus Listener:
  // - 1000ms heartbeat when an active conversation is open
  // - 2500ms when idle
  // - Instant sync when user tabs into the window
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    let isMounted = true;
    let timerId = null;

    const runSync = async () => {
      if (!isMounted) return;

      try {
        await refreshUnreadCount();
        if (activeIdRef.current) {
          await refreshMessages(activeIdRef.current, true);
        } else {
          await refreshConversations(true);
        }
      } catch {}

      if (isMounted) {
        // If chat is open: 1.0 second fast poll; otherwise 2.5 seconds
        const interval = activeIdRef.current ? 1000 : 2500;
        timerId = setTimeout(runSync, interval);
      }
    };

    timerId = setTimeout(runSync, 1000);

    const onFocus = () => {
      refreshUnreadCount();
      refreshConversations(true);
      if (activeIdRef.current) {
        refreshMessages(activeIdRef.current, true);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocus();
    });

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('focus', onFocus);
    };
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

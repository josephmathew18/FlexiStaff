import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Send,
  Paperclip,
  X,
  ChevronLeft,
  Check,
  CheckCheck,
  FolderKanban,
  User,
  Plus,
  Smile,
  FileText,
  Image as ImageIcon,
  Download,
  Building2,
  Briefcase,
  Shield,
  LifeBuoy,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

export const ChatView = ({ title = 'Messages' }) => {
  const { user: authUser } = useAuth() || {};
  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    contacts,
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
  } = useChat();

  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle URL query params (e.g. ?userId=22&projectId=1) to auto-open conversation
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    const targetProjectId = searchParams.get('projectId');
    if (targetUserId) {
      const uId = Number(targetUserId);
      const pId = targetProjectId ? Number(targetProjectId) : null;
      openConversationWith({ recipientUserId: uId, projectId: pId });
    }
  }, [searchParams, openConversationWith]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesLoading]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // If a search query is active, search across all categories without filter tab restriction
      if (!searchQuery.trim()) {
        if (filter === 'unread' && c.unreadCount <= 0) return false;
        if (filter === 'projects' && !c.projectId) return false;
      }

      // Search query across title, messages, names, roles, projects, emails
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const lastMsgMatch = (c.lastMessage || '').toLowerCase().includes(q);
        const nameMatch = (c.otherParticipant?.fullName || '').toLowerCase().includes(q);
        const emailMatch = (c.otherParticipant?.email || '').toLowerCase().includes(q);
        const roleMatch = (c.otherParticipant?.role || '').toLowerCase().includes(q);
        const projMatch = (c.projectTitle || '').toLowerCase().includes(q);
        return titleMatch || lastMsgMatch || nameMatch || emailMatch || roleMatch || projMatch;
      }
      return true;
    });
  }, [conversations, filter, searchQuery]);

  // People & contacts matching the sidebar search
  const searchMatchingContacts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    // Exclude contacts who already have an active conversation displayed in filteredConversations
    const activeParticipantIds = new Set(
      filteredConversations.map((c) => c.otherParticipant?.id).filter(Boolean)
    );
    return contacts.filter(
      (contact) =>
        !activeParticipantIds.has(contact.id) &&
        ((contact.fullName || '').toLowerCase().includes(q) ||
          (contact.role || '').toLowerCase().includes(q) ||
          (contact.email || '').toLowerCase().includes(q) ||
          (contact.companyName || '').toLowerCase().includes(q) ||
          (contact.projectTitle || '').toLowerCase().includes(q))
    );
  }, [contacts, searchQuery, filteredConversations]);

  // Filter eligible contacts for "New Message" modal
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        (c.fullName || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.companyName || '').toLowerCase().includes(q) ||
        (c.projectTitle || '').toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let attachmentPayload = {};
    if (selectedFile) {
      setUploading(true);
      const res = await uploadAttachment(selectedFile);
      setUploading(false);
      if (!res) return;
      attachmentPayload = {
        attachmentUrl: res.attachmentUrl,
        attachmentName: res.attachmentName,
        attachmentSize: res.attachmentSize,
        attachmentType: res.attachmentType,
        messageType: res.attachmentType === 'IMAGE' ? 'IMAGE' : 'FILE',
      };
    }

    const payload = {
      content: inputText.trim(),
      ...attachmentPayload,
    };

    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await sendMessage(payload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConversationTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getRoleBadge = (roleStr) => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('admin')) {
      return { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800/40', label: 'Admin' };
    }
    if (r.includes('manager')) {
      return { bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40', label: 'HR Manager' };
    }
    if (r.includes('client')) {
      return { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40', label: 'Client' };
    }
    if (r.includes('partner')) {
      return { bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800/40', label: 'Partner' };
    }
    return { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800/40', label: 'Professional' };
  };

  return (
    <div className="relative flex h-[calc(100vh-5rem)] w-full overflow-hidden rounded-2xl bg-white dark:bg-[#0f111a] shadow-xl border border-slate-200/80 dark:border-white/10">
      {/* ========================================================================= */}
      {/* 1. CONVERSATION SIDEBAR */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#141622]/60 w-full md:w-80 lg:w-96 shrink-0 transition-all duration-200 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header (Instagram Direct Style) */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/30">
              {conversations.length}
            </span>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-150"
            title="New Message"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search messages, people, or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#1b1e2e] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'projects', label: 'Projects' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1b1e2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation & People List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {loading && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
              <p className="text-xs">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 && searchMatchingContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {searchQuery ? `No matches found for "${searchQuery}"` : 'No conversations found'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {searchQuery ? 'Try searching by person name, role, or project' : 'Start a new conversation with a contact'}
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Plus size={14} /> Start Message
              </button>
            </div>
          ) : (
            <>
              {/* Existing Conversations */}
              {filteredConversations.map((c) => {
                const other = c.otherParticipant;
                const isSelected = c.id === activeConversationId;
                const roleBadge = getRoleBadge(other?.role);

                return (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full flex items-start gap-3 p-3.5 text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-white dark:hover:bg-[#1a1d2d]'
                    }`}
                  >
                    {/* Avatar with Instagram-style ring */}
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600">
                        <img
                          src={
                            other?.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              other?.fullName || c.title || 'User'
                            )}`
                          }
                          alt=""
                          className="h-full w-full rounded-full object-cover bg-white dark:bg-slate-800"
                        />
                      </div>
                      {other?.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141622]" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {c.title}
                          </span>
                          {other?.role && (
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${roleBadge.bg}`}
                            >
                              {roleBadge.label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatConversationTime(c.lastMessageTime)}
                        </span>
                      </div>

                      {c.projectTitle && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                          <FolderKanban size={10} />
                          <span className="truncate">{c.projectTitle}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {c.lastMessage || 'No messages yet'}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* People & Contacts Matching Search */}
              {searchMatchingContacts.length > 0 && (
                <div className="border-t border-slate-200/80 dark:border-white/10">
                  <div className="px-3.5 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                    <span>People ({searchMatchingContacts.length})</span>
                    <span className="text-[9px] font-medium lowercase text-indigo-500 dark:text-indigo-400">Click to chat</span>
                  </div>
                  {searchMatchingContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role);
                    return (
                      <button
                        key={contact.id}
                        onClick={async () => {
                          setSearchQuery('');
                          await openConversationWith({
                            recipientUserId: contact.id,
                            projectId: contact.projectId,
                          });
                        }}
                        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-white dark:hover:bg-[#1a1d2e] transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              contact.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                contact.fullName || 'User'
                              )}`
                            }
                            alt=""
                            className="h-10 w-10 rounded-full object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                                {contact.fullName}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {contact.companyName || contact.email}
                              {contact.projectTitle && ` • ${contact.projectTitle}`}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition shrink-0 ml-2">
                          Message
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE CONVERSATION WINDOW */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col flex-1 bg-white dark:bg-[#0f111a] ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 py-3 bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => selectConversation(null)}
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="relative">
                  <img
                    src={
                      activeConversation.otherParticipant?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        activeConversation.title || 'User'
                      )}`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-white/10 bg-slate-100"
                  />
                  {activeConversation.otherParticipant?.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f111a]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {activeConversation.title}
                    </h3>
                    {activeConversation.otherParticipant?.role && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                          getRoleBadge(activeConversation.otherParticipant.role).bg
                        }`}
                      >
                        {getRoleBadge(activeConversation.otherParticipant.role).label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {activeConversation.projectTitle ? (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                        <FolderKanban size={12} /> {activeConversation.projectTitle}
                      </span>
                    ) : (
                      <span>Active direct conversation</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Context Action */}
              {activeConversation.projectId && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  <Briefcase size={12} /> Project Chat
                </span>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-[#0b0d14]/40">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3">
                    <Smile size={32} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Start a conversation with {activeConversation.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    Send a message or share project documents directly. All communications are saved securely.
                  </p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.isMine;

                  return (
                    <motion.div
                      key={m.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {/* Bubble */}
                      <div
                        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${
                          isMine
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-br-xs shadow-md'
                            : 'bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white rounded-bl-xs border border-slate-200/80 dark:border-white/10 shadow-xs'
                        }`}
                      >
                        {/* Text Content */}
                        {m.content && (
                          <p className="whitespace-pre-wrap leading-relaxed break-words">
                            {m.content}
                          </p>
                        )}

                        {/* Attachment (Image) */}
                        {m.messageType === 'IMAGE' && m.attachmentUrl && (
                          <div className="mt-2 overflow-hidden rounded-xl">
                            <img
                              src={m.attachmentUrl}
                              alt={m.attachmentName || 'Attachment'}
                              onClick={() => setPreviewImage(m.attachmentUrl)}
                              className="max-h-60 w-auto rounded-lg object-cover cursor-pointer hover:opacity-95 transition"
                            />
                          </div>
                        )}

                        {/* Attachment (File / Document) */}
                        {m.messageType === 'FILE' && m.attachmentUrl && (
                          <div
                            className={`mt-2 flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                              isMine
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={18} className="shrink-0 text-indigo-400" />
                              <div className="truncate">
                                <p className="text-xs font-semibold truncate">
                                  {m.attachmentName || 'Document'}
                                </p>
                                {m.attachmentSize && (
                                  <p className="text-[10px] opacity-75">
                                    {(m.attachmentSize / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                            </div>
                            <a
                              href={m.attachmentUrl}
                              download={m.attachmentName || 'document'}
                              target="_blank"
                              rel="noreferrer"
                              className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition shrink-0 ${
                                isMine ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              <Download size={15} />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Read Receipt */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 px-1">
                        <span>{formatMessageTime(m.createdAt)}</span>
                        {isMine && (
                          m.isRead ? (
                            <CheckCheck size={13} className="text-blue-500" title="Read" />
                          ) : (
                            <Check size={13} className="text-slate-400" title="Sent" />
                          )
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Selected File Upload Preview Bar */}
            {selectedFile && (
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-[#141622] px-4 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="rounded-full p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-slate-200/80 dark:border-white/10 p-3 bg-white dark:bg-[#0f111a]">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  title="Attach file or photo"
                >
                  <Paperclip size={18} />
                </button>

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  className="flex-1 resize-none rounded-xl bg-slate-100/80 dark:bg-[#171a29] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#1e2235] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all max-h-28"
                />

                <button
                  type="submit"
                  disabled={uploading || (!inputText.trim() && !selectedFile)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-sm transition-all"
                  title="Send message"
                >
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State when no conversation selected */
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-slate-50/30 dark:bg-[#0b0d14]/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-800/30 mb-4">
              <Send size={36} className="text-indigo-600 dark:text-indigo-400 ml-1" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Messages
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Send private, real-time messages to your clients, managers, partners, or assigned professionals.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow transition"
            >
              <Plus size={16} /> Send Message
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. NEW MESSAGE MODAL (ELIGIBLE CONTACTS) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#141624] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  New Message
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search authorized contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#1b1e2e] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-2">
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No authorized contacts found matching "{contactSearch}".
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role);
                    return (
                      <button
                        key={contact.id}
                        onClick={async () => {
                          setShowNewChatModal(false);
                          await openConversationWith({
                            recipientUserId: contact.id,
                            projectId: contact.projectId,
                          });
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              contact.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                contact.fullName || 'User'
                              )}`
                            }
                            alt=""
                            className="h-9 w-9 rounded-full object-cover bg-slate-100"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                {contact.fullName}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {contact.companyName || contact.email}
                              {contact.projectTitle && ` • ${contact.projectTitle}`}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight size={15} className="text-slate-400 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. LIGHTBOX IMAGE PREVIEW MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="Enlarged preview"
                className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 rounded-full bg-black/60 text-white p-2 hover:bg-black/80 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatView;

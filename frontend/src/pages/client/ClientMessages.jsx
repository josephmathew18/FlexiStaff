import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  CheckCircle2,
  User,
  ShieldCheck,
  Building2,
  Clock,
  MoreVertical,
  Smile,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ClientMessages = () => {
  const { clientProfile } = useData() || {};

  const [activeChannelId, setActiveChannelId] = useState('ch-1');
  const [inputText, setInputText] = useState('');

  const [channels, setChannels] = useState([
    {
      id: 'ch-1',
      name: 'Alex Morgan',
      role: 'FlexiStaff Client Success Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      online: true,
      unread: false,
      lastMessage: 'All 3 requested React engineers have been assigned to your sprint.',
      lastTime: '10:45 AM',
      messages: [
        {
          id: 'm1',
          sender: 'Alex Morgan',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          text: 'Hello David! I have reviewed your latest project requirement for the Cloud Modernization sprint.',
          time: '10:30 AM',
        },
        {
          id: 'm2',
          sender: 'David Sterling',
          isClient: true,
          avatar: clientProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          text: 'Thanks Alex! We need senior engineers with strong React and TypeScript experience.',
          time: '10:35 AM',
        },
        {
          id: 'm3',
          sender: 'Alex Morgan',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          text: 'All 3 requested React engineers have been assigned to your sprint. Production kickoff is set for Monday!',
          time: '10:45 AM',
        },
      ],
    },
    {
      id: 'ch-2',
      name: 'FlexiStaff Admin Operations',
      role: 'Enterprise Platform Support',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      online: true,
      unread: true,
      lastMessage: 'Your Q3 SOW billing agreement has been approved.',
      lastTime: 'Yesterday',
      messages: [
        {
          id: 'm201',
          sender: 'FlexiStaff Admin',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
          text: 'Your Q3 SOW billing agreement has been approved. Invoice verification sent to accounting.',
          time: 'Yesterday',
        },
      ],
    },
    {
      id: 'ch-3',
      name: 'Apex Digital Partner Lead',
      role: 'Partner Engineering Pod Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      online: false,
      unread: false,
      lastMessage: 'Sprint 4 test suite coverage reached 96%.',
      lastTime: 'Aug 24',
      messages: [
        {
          id: 'm301',
          sender: 'Apex Digital Lead',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
          text: 'Sprint 4 test suite coverage reached 96%. All automated regression tests passed.',
          time: 'Aug 24',
        },
      ],
    },
  ]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      sender: clientProfile?.name || 'David Sterling',
      isClient: true,
      avatar: clientProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      text: inputText.trim(),
      time: 'Just now',
    };

    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === activeChannelId) {
          return {
            ...ch,
            lastMessage: newMessage.text,
            lastTime: 'Just now',
            messages: [...ch.messages, newMessage],
          };
        }
        return ch;
      })
    );

    setInputText('');
    toast.success('Message sent');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Client Communications Center
              </h1>
              <p className="text-xs text-slate-500">
                Direct real-time messaging with your FlexiStaff Manager, Admin Support, and Partner Pod Leads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encrypted Enterprise Channel</span>
          </span>
        </div>
      </div>

      {/* Main Messaging Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[600px]">
        {/* Left Side: Channel List */}
        <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {channels.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
                <div
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-emerald-50/60 border-l-4 border-emerald-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={ch.avatar} alt={ch.name} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-xs" />
                    {ch.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{ch.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{ch.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold truncate mt-0.5">{ch.role}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-1">{ch.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {/* Active Channel Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <img src={activeChannel.avatar} alt={activeChannel.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-100" />
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">{activeChannel.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-bold">{activeChannel.role}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">{activeChannel.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>

            <button type="button" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
            {activeChannel.messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.isClient ? 'flex-row-reverse' : ''}`}>
                <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5" />
                <div className={`max-w-md space-y-1 ${msg.isClient ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.isClient
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.info('File attachment feature simulation')}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeChannel.name}...`}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 px-4 text-xs outline-none focus:border-emerald-600"
            />

            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;

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
      name: 'Alex Vance (Lead Manager)',
      role: 'Senior Delivery Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      online: true,
      lastMessage: 'The sprint deliverables are on track for Friday review.',
      lastTime: '10:42 AM',
      messages: [
        {
          id: 'm-1',
          sender: 'Alex Vance',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          text: 'Hello David! Welcome to your FlexiStaff project workspace. I am your assigned Delivery Lead.',
          time: '10:30 AM',
        },
        {
          id: 'm-2',
          sender: 'Alex Vance',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          text: 'The sprint deliverables are on track for Friday review.',
          time: '10:42 AM',
        },
      ],
    },
    {
      id: 'ch-2',
      name: 'TechCorp Partner Pod',
      role: 'Engineering Partner',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
      online: false,
      lastMessage: 'Resource allocations for Q3 have been confirmed.',
      lastTime: 'Yesterday',
      messages: [
        {
          id: 'm-3',
          sender: 'TechCorp Support',
          isClient: false,
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
          text: 'Resource allocations for Q3 have been confirmed.',
          time: 'Yesterday',
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
            messages: [...(ch.messages || []), newMessage],
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
            {channels.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No active message channels</p>
                <p className="text-[11px] text-slate-400 mt-1">Start a conversation when assigned to a project.</p>
              </div>
            ) : (
              channels.map((ch) => {
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
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {!activeChannel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Channel Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a channel from the list or contact your assigned manager to start a secure conversation.
              </p>
            </div>
          ) : (
            <>
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
                {activeChannel.messages?.map((msg) => (
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
                  placeholder={`Message ${activeChannel?.name || 'channel'}...`}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 px-4 text-xs outline-none focus:border-emerald-600"
                />

                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;

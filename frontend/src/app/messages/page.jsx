'use client';
import Navbar from '@/components/Navbar';
import { Button, EmptyState, Loader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationAPI } from '@/lib/api';
import { disconnectSocket, getSocket } from '@/lib/socket';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function MessagesContent() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const convIdParam = searchParams.get('conv');
  const [activeView, setActiveView] = useState('list');
  const [selectedConv, setSelectedConv] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const currentConvIdRef = useRef(null);

  // scroll to latest msg
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const token = localStorage.getItem('kalasetu_token');
    if (!token) return;
    const sock = getSocket(token);
    socketRef.current = sock;

    sock.on('message:new', (msg) => {
      if (
        msg.conversation === currentConvIdRef.current ||
        msg.conversation?._id === currentConvIdRef.current
      ) {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // set the incoming as read since chat is open
        conversationAPI.markRead(currentConvIdRef.current).catch(() => {});
      }

      setConversations((prev) =>
        prev.map((c) =>
          c._id === (msg.conversation?._id || msg.conversation)
            ? { ...c, lastMessage: { text: msg.text }, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
    });

    return () => {
      sock.off('message:new');
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await conversationAPI.getConversations();
        const convs = res.data?.conversations || [];
        setConversations(convs);
        // this is for when we click on a profile to open msg
        if (convIdParam && convs.length > 0) {
          const idx = convs.findIndex((c) => c._id === convIdParam);
          if (idx >= 0) setSelectedConv(idx);
        }
      } catch (e) {
        if (e?.status !== 401) console.error(e);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const conv = conversations[selectedConv];
    if (!conv) return;

    // leave prev, join new
    const sock = socketRef.current;
    if (sock) {
      if (currentConvIdRef.current) sock.emit('leave:conversation', currentConvIdRef.current);
      sock.emit('join:conversation', conv._id);
    }
    currentConvIdRef.current = conv._id;

    conversationAPI
      .getMessages(conv._id)
      .then((res) => setChatMessages(res.data?.messages || []))
      .catch((e) => {
        if (e?.status !== 401) console.error(e);
      });

    conversationAPI.markRead(conv._id).catch(() => {});
  }, [selectedConv, conversations]);

  const selectConversation = (index) => {
    setSelectedConv(index);
    setActiveView('chat');
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !conversations[selectedConv]) return;
    const text = newMsg.trim();
    setNewMsg('');
    try {
      const res = await conversationAPI.sendMessage(conversations[selectedConv]._id, text);
      const sent = res.data?.message;
      if (sent) {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === sent._id)) return prev;
          return [...prev, sent];
        });
      }
    } catch (e) {
      if (e?.status !== 401) console.error(e);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !authUser)
      return { name: 'Unknown', avatar: '/avatar-placeholder.svg', role: '' };
    const other =
      conv.participants.find((p) => (p._id || p) !== authUser._id) || conv.participants[0];
    return {
      name: other?.fullName || other?.name || 'Unknown',
      avatar: other?.avatar || '/avatar-placeholder.svg',
      role: other?.title || other?.role || '',
    };
  };

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader />
      </>
    );
  }

  const currentConv = conversations[selectedConv];
  const currentOther = currentConv
    ? getOtherParticipant(currentConv)
    : { name: 'Select a conversation', avatar: '/avatar-placeholder.svg' };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
        {/* mobile tab */}
        <div className="flex md:hidden gap-2 mb-3">
          <Button
            onClick={() => setActiveView('list')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'list' ? 'bg-[var(--primary-color)] text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">chat</span>Chats
          </Button>
          <Button
            onClick={() => setActiveView('chat')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'chat' ? 'bg-[var(--primary-color)] text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">forum</span>Chat
          </Button>
        </div>

        <div className="flex gap-4 h-[calc(100%-3rem)] md:h-full">
          {/* sidebar */}
          <div
            className={`${activeView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-shrink-0 flex-col bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden`}
          >
            <div className="p-4 border-b border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-bold text-lg text-[var(--text-primary)] serif-font flex-1">
                  Messages
                </h2>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2 text-stone-400 text-lg">
                  search
                </span>
                <input
                  className="w-full bg-stone-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"
                  placeholder="Search messages..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <EmptyState
                  className="py-8"
                  icon="chat_bubble"
                  iconClassName="text-3xl"
                  description="No conversations yet."
                />
              )}
              {conversations.map((conv, i) => {
                const other = getOtherParticipant(conv);
                return (
                  <div
                    key={conv._id || i}
                    onClick={() => selectConversation(i)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${i === selectedConv ? 'bg-orange-50 border-l-4 border-[var(--primary-color)]' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Image
                        alt={other.name}
                        className="w-12 h-12 rounded-full object-cover"
                        src={other.avatar}
                        width={48}
                        height={48}
                        unoptimized
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {other.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 flex-shrink-0">
                          {timeAgo(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate">
                        {conv.lastMessage?.text || conv.lastMsg || ''}
                      </p>
                    </div>
                    {(conv.unreadCount || 0) > 0 && (
                      <span className="bg-[var(--primary-color)] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* chat screen */}
          <div
            className={`${activeView === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden`}
          >
            <div className="p-3 sm:p-4 border-b border-stone-100 flex items-center gap-3">
              <Button
                onClick={() => setActiveView('list')}
                className="md:hidden text-stone-400 hover:text-[var(--primary-color)] -ml-1"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Button>
              <Image
                alt="Chat"
                className="w-10 h-10 rounded-full object-cover"
                src={currentOther.avatar}
                width={40}
                height={40}
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--text-primary)] truncate">
                  {currentOther.name}
                </h3>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 bg-stone-50">
              {chatMessages.length === 0 && (
                <EmptyState className="py-8" description="No messages yet. Say hello!" />
              )}
              {chatMessages.map((msg, i) => {
                const isMe = (msg.sender?._id || msg.sender) === authUser?._id || msg.from === 'me';
                return (
                  <div
                    key={msg._id || i}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-[var(--primary-color)] text-white rounded-br-sm' : 'bg-white text-[var(--text-primary)] rounded-bl-sm shadow-sm border border-stone-100'}`}
                    >
                      <p>{msg.text || msg.content}</p>
                      <span
                        className={`text-[10px] mt-1 block text-right ${isMe ? 'text-white/60' : 'text-stone-400'}`}
                      >
                        {msg.time ||
                          (msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-stone-100 flex items-center gap-2 sm:gap-3">
              <input
                className="flex-1 min-w-0 bg-stone-50 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"
                placeholder="Type a message..."
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button
                onClick={sendMessage}
                className="bg-[var(--primary-color)] text-white w-10 h-10 rounded-full hover:bg-[var(--secondary-color)] transition-colors flex-shrink-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MessagesContent />
    </Suspense>
  );
}

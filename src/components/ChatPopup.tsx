"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Plus, Users, ChevronLeft, Search, Hash, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkspaceMember {
    userId: string;
    role: string;
    user: { id: string; name: string | null; image: string | null };
}

interface Conversation {
    id: string;
    type: 'direct' | 'group';
    name: string | null;
    members: { userId: string; user: { id: string; name: string | null; image: string | null } }[];
    messages: { id: string; content: string; createdAt: string; user: { id: string; name: string | null } }[];
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string | null; image: string | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 8 }: { name?: string | null; size?: number }) {
    const letter = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['from-brand-600 to-brand-400', 'from-purple-600 to-purple-400', 'from-pink-600 to-pink-400', 'from-emerald-600 to-emerald-400'];
    const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    return (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {letter}
        </div>
    );
}

function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
        ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ─── Main Popup ───────────────────────────────────────────────────────────────
export function ChatPopup() {
    const { data: session } = useSession();
    const myId = (session?.user as any)?.id;

    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat' | 'new' | 'newGroup'>('list');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [search, setSearch] = useState('');
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // ── Fetch conversations ──
    const fetchConversations = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch {}
    }, [session]);

    // ── Fetch members of workspace ──
    const fetchMembers = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/workspace');
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch {}
    }, [session]);

    // ── Poll messages in active conv ──
    const fetchMessages = useCallback(async (convId: string) => {
        try {
            const res = await fetch(`/api/conversations/${convId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch {}
    }, []);

    useEffect(() => {
        if (open && session) {
            fetchConversations();
            fetchMembers();
        }
    }, [open, session, fetchConversations, fetchMembers]);

    useEffect(() => {
        if (activeConv) {
            fetchMessages(activeConv.id);
            pollRef.current = setInterval(() => fetchMessages(activeConv.id), 4000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [activeConv, fetchMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Send message ──
    const handleSend = async () => {
        if (!input.trim() || !activeConv) return;
        const text = input.trim();
        setInput('');
        const optimistic: Message = {
            id: `tmp-${Date.now()}`,
            content: text,
            createdAt: new Date().toISOString(),
            user: { id: myId, name: session?.user?.name ?? 'Eu', image: null }
        };
        setMessages(prev => [...prev, optimistic]);
        try {
            await fetch(`/api/conversations/${activeConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });
            fetchMessages(activeConv.id);
        } catch {}
    };

    // ── Start DM ──
    const startDM = async (memberId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'direct', memberIds: [memberId] })
            });
            if (res.ok) {
                const conv = await res.json();
                setActiveConv(conv);
                setView('chat');
                fetchConversations();
            }
        } catch {}
    };

    // ── Create group ──
    const createGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'group', name: groupName, memberIds: selectedMembers })
            });
            if (res.ok) {
                const conv = await res.json();
                setActiveConv(conv);
                setView('chat');
                setGroupName('');
                setSelectedMembers([]);
                fetchConversations();
            }
        } catch {}
    };

    // ── Conv display name ──
    const convName = (c: Conversation) => {
        if (c.type === 'group') return c.name ?? 'Grupo';
        const other = c.members.find(m => m.userId !== myId);
        return other?.user.name ?? 'Conversa';
    };

    const otherMember = (c: Conversation) => c.members.find(m => m.userId !== myId);

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-500 shadow-2xl shadow-brand-900/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
                {open ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
                {unread > 0 && !open && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
                )}
            </button>

            {/* Popup Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-[199] w-[360px] h-[520px] bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                    {/* ── List View ── */}
                    {view === 'list' && (
                        <>
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                <h2 className="text-sm font-bold text-white">Mensagens</h2>
                                <div className="flex gap-1">
                                    <button onClick={() => setView('new')} title="Nova mensagem" className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                    <button onClick={() => setView('newGroup')} title="Novo grupo" className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                                        <Users size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
                                        <MessageSquare size={32} className="text-brand-500 opacity-50" />
                                        <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.<br />Clique em + para começar!</p>
                                    </div>
                                ) : (
                                    conversations.map(c => {
                                        const last = c.messages[0];
                                        const other = otherMember(c);
                                        return (
                                            <button key={c.id} onClick={() => { setActiveConv(c); setView('chat'); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/[0.04]">
                                                {c.type === 'group' ? (
                                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                        <Hash size={15} className="text-brand-400" />
                                                    </div>
                                                ) : (
                                                    <Avatar name={other?.user.name} size={9} />
                                                )}
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-medium text-white truncate">{convName(c)}</p>
                                                        {last && <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatTime(last.createdAt)}</span>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {last ? `${last.user.id === myId ? 'Você' : last.user.name}: ${last.content}` : 'Nenhuma mensagem ainda'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}

                    {/* ── New DM View ── */}
                    {view === 'new' && (
                        <>
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                                <button onClick={() => setView('list')} className="text-muted-foreground hover:text-white">
                                    <ChevronLeft size={18} />
                                </button>
                                <h2 className="text-sm font-bold text-white">Nova Mensagem</h2>
                            </div>
                            <div className="px-3 py-2 border-b border-white/5">
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                                    <Search size={14} className="text-muted-foreground" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar membro..." className="bg-transparent text-sm outline-none text-white placeholder-muted-foreground flex-1" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {members.filter(m => m.userId !== myId && (m.user.name ?? '').toLowerCase().includes(search.toLowerCase())).map(m => (
                                    <button key={m.userId} onClick={() => startDM(m.userId)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                                        <Avatar name={m.user.name} size={8} />
                                        <div>
                                            <p className="text-sm font-medium text-white">{m.user.name}</p>
                                            <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── New Group View ── */}
                    {view === 'newGroup' && (
                        <>
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                                <button onClick={() => setView('list')} className="text-muted-foreground hover:text-white"><ChevronLeft size={18} /></button>
                                <h2 className="text-sm font-bold text-white">Novo Grupo</h2>
                            </div>
                            <div className="p-3 border-b border-white/5 space-y-2">
                                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Nome do grupo..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-muted-foreground outline-none focus:border-brand-500/50" />
                            </div>
                            <p className="text-[11px] text-muted-foreground px-4 py-2">Selecione os membros:</p>
                            <div className="flex-1 overflow-y-auto">
                                {members.filter(m => m.userId !== myId).map(m => {
                                    const selected = selectedMembers.includes(m.userId);
                                    return (
                                        <button key={m.userId} onClick={() => setSelectedMembers(prev => selected ? prev.filter(id => id !== m.userId) : [...prev, m.userId])}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${selected ? 'bg-brand-500/10' : 'hover:bg-white/5'}`}>
                                            <div className="relative">
                                                <Avatar name={m.user.name} size={8} />
                                                {selected && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 border-2 border-[#0f1117] flex items-center justify-center"><span className="text-white text-[8px]">✓</span></div>}
                                            </div>
                                            <p className="text-sm font-medium text-white">{m.user.name}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-3 border-t border-white/5">
                                <button onClick={createGroup} disabled={!groupName.trim() || selectedMembers.length === 0}
                                    className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-sm font-semibold text-white transition-colors">
                                    Criar Grupo ({selectedMembers.length} membros)
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Chat View ── */}
                    {view === 'chat' && activeConv && (
                        <>
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                                <button onClick={() => { setView('list'); setActiveConv(null); setMessages([]); }} className="text-muted-foreground hover:text-white"><ChevronLeft size={18} /></button>
                                {activeConv.type === 'group' ? (
                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><Hash size={13} className="text-brand-400" /></div>
                                ) : (
                                    <Avatar name={otherMember(activeConv)?.user.name} size={7} />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-white">{convName(activeConv)}</p>
                                    {activeConv.type === 'group' && <p className="text-[10px] text-muted-foreground">{activeConv.members.length} membros</p>}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                                        <MessageSquare size={28} className="text-brand-500" />
                                        <p className="text-xs text-muted-foreground text-center">Nenhuma mensagem ainda.<br />Diga olá! 👋</p>
                                    </div>
                                )}
                                {messages.map(msg => {
                                    const isMe = msg.user.id === myId;
                                    return (
                                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {!isMe && <Avatar name={msg.user.name} size={6} />}
                                            <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                {!isMe && <p className="text-[10px] text-muted-foreground mb-0.5 pl-1">{msg.user.name}</p>}
                                                <div className={`px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words ${isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white/[0.07] text-white rounded-bl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                                <p className="text-[9px] text-muted-foreground mt-0.5 px-1">{formatTime(msg.createdAt)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <div className="p-3 border-t border-white/5">
                                <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-brand-500/40 transition-colors">
                                    <textarea value={input} onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder={`Mensagem para ${convName(activeConv)}...`}
                                        rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-muted-foreground resize-none outline-none max-h-20" />
                                    <button onClick={handleSend} disabled={!input.trim()}
                                        className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors">
                                        <Send size={12} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

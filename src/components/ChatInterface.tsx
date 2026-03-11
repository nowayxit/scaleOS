"use client";

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    }
}

export function ChatInterface() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentUserId = (session?.user as any)?.id;

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            // silent fail for polling
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll every 5 seconds
        intervalRef.current = setInterval(fetchMessages, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);
        const optimistic: Message = {
            id: `temp-${Date.now()}`,
            content: input.trim(),
            createdAt: new Date().toISOString(),
            user: { id: currentUserId, name: session?.user?.name ?? 'Você', image: session?.user?.image ?? null }
        };
        setMessages(prev => [...prev, optimistic]);
        const text = input.trim();
        setInput('');

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });
            if (res.ok) {
                await fetchMessages(); // refresh to get actual server message
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
                        <div className="text-4xl">💬</div>
                        <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.<br />Seja o primeiro a dizer olá!</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.user.id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${isMe ? 'bg-brand-600' : 'bg-white/10'}`}>
                                {msg.user.name ? msg.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            {/* Bubble */}
                            <div className={`max-w-[75%] group`}>
                                {!isMe && (
                                    <p className="text-[10px] text-muted-foreground mb-1 pl-1">{msg.user.name}</p>
                                )}
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white/[0.07] text-white rounded-bl-sm border border-white/5'}`}>
                                    {msg.content}
                                </div>
                                <p className={`text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                                    {formatTime(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-brand-500/50 transition-colors">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Mensagem para o time..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-white placeholder-muted-foreground resize-none outline-none max-h-32"
                        style={{ lineHeight: '1.5' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <Send size={14} className="text-white" />
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 pl-1">Enter para enviar · Shift+Enter para nova linha</p>
            </div>
        </div>
    );
}

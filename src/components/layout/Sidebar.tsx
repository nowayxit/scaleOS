"use client";

import Link from 'next/link';
import { LayoutDashboard, Users, Workflow, BarChart3, Settings, Bell, Zap, ListTodo, Link2, X, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useSession, signOut } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { PomodoroTimer } from '../PomodoroTimer';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export function Sidebar() {
    const pathname = usePathname();
    const agency = useAppStore(s => s.agency);
    const clients = useAppStore(s => s.clients);
    const { data: session } = useSession();
    const [showNotifications, setShowNotifications] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const overdueClients = useMemo(() => 
        clients.filter(c => c.nextReviewDate && c.nextReviewDate < today)
    , [clients, today]);

    const navItems = [
        { label: 'Visão Geral', icon: LayoutDashboard, href: '/' },
        { label: 'Clientes & Contas', icon: Users, href: '/clientes' },
        { label: 'Gestão de Tarefas', icon: ListTodo, href: '/tarefas' },
        { label: 'Cases dos Clientes', icon: BarChart3, href: '/cases' },
        { label: 'Central de Links', icon: Link2, href: '/vault' },
        { label: 'Chat da Equipe', icon: MessageSquare, href: '/chat' },
    ];

    return (
        <aside className="w-64 border-r border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50 transition-all">
            <div className="p-6">
                <Link href="/">
                    <h1 className="text-xl font-bold tracking-tighter flex items-center gap-1.5 cursor-pointer group">
                        <div className="w-6 h-6 rounded bg-brand-500 shadow-[0_0_15px_rgba(89,115,255,0.6)] group-hover:scale-110 transition-transform"></div>
                        <span>Scale<span className="text-white">OS</span></span>
                    </h1>
                </Link>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest pl-8 text-brand-400">Operating System</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Main Console</div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-all ${isActive
                                    ? 'bg-brand-500/10 text-brand-100 border border-brand-500/20'
                                    : 'text-muted-foreground hover:bg-white/[0.03] hover:text-white border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={isActive ? "text-brand-500" : ""} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(89,115,255,1)]"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-card-border mt-auto bg-black/20">

                {/* Pomodoro Timer */}
                <PomodoroTimer />

                <div className="relative">
                    <div className="flex items-center justify-between px-3 py-2 text-muted-foreground w-full mb-2">
                        <button 
                            onClick={() => setShowNotifications(prev => !prev)}
                            className="relative"
                        >
                            <Bell size={16} className="hover:text-white cursor-pointer transition-colors" />
                            {overdueClients.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-status-red text-[8px] font-bold text-white flex items-center justify-center shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                                    {overdueClients.length}
                                </span>
                            )}
                        </button>
                        <Link href="/configuracoes"><Settings size={16} className="hover:text-white cursor-pointer transition-colors" /></Link>
                    </div>

                    {showNotifications && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111] border border-card-border rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="px-3 py-2 border-b border-card-border flex justify-between items-center">
                                <p className="text-xs font-semibold text-white">Notificações</p>
                                <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-white"><X size={14}/></button>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {overdueClients.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center px-3 py-4">Nenhuma revisão pendente. ✅</p>
                                ) : (
                                    overdueClients.map(c => (
                                        <Link key={c.id} href={`/cockpit/${c.id}`} onClick={() => setShowNotifications(false)}
                                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-card-border/50 last:border-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-status-red shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-white font-medium truncate">{c.name}</p>
                                                <p className="text-[10px] text-status-red font-mono">Revisão vencida · {c.nextReviewDate}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Workspace / Agency Select Dropdown */}
                <WorkspaceSwitcher />

                <button 
                    onClick={async () => {
                        useAppStore.persist.clearStorage();
                        await signOut({ callbackUrl: '/login' });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-status-red/80 hover:text-status-red hover:bg-status-red/10 border border-transparent hover:border-status-red/20 transition-all"
                >
                    Sair da conta
                </button>
            </div>
        </aside>
    );
}

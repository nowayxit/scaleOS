"use client";

import Link from 'next/link';
import { LayoutDashboard, Users, Workflow, BarChart3, Settings, Bell, Zap, ListTodo } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export function Sidebar() {
    const pathname = usePathname();
    const zenMode = useAppStore(s => s.zenMode);
    const toggleZenMode = useAppStore(s => s.toggleZenMode);

    const navItems = [
        { label: 'The Tower', icon: LayoutDashboard, href: '/' },
        { label: 'The Ad Lab', icon: Workflow, href: '/adlab' },
        { label: 'Clientes & Contas', icon: Users, href: '/clientes' },
        { label: 'Gestão de Tarefas', icon: ListTodo, href: '/tarefas' },
        { label: 'Relatórios', icon: BarChart3, href: '/relatorios' },
    ];

    return (
        <aside className={`w-64 border-r border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50 transition-all ${zenMode.active ? 'opacity-20 hover:opacity-100' : ''}`}>
            <div className="p-6">
                <Link href="/">
                    <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer group">
                        <div className="w-6 h-6 rounded bg-brand-500 shadow-[0_0_15px_rgba(89,115,255,0.6)] group-hover:scale-110 transition-transform"></div>
                        Scale<span className="text-brand-500">OS</span>
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

                {/* Modo Foco Zen - FUNCIONAL */}
                <button
                    onClick={() => toggleZenMode()}
                    className={`w-full rounded-lg p-3 mb-4 flex items-start gap-3 relative overflow-hidden transition-all cursor-pointer ${zenMode.active
                            ? 'bg-brand-600/30 border border-brand-400/50 shadow-[0_0_20px_rgba(89,115,255,0.3)]'
                            : 'bg-brand-600/10 border border-brand-500/20 hover:bg-brand-600/20'
                        }`}
                >
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-500/20 blur-xl rounded-full pointer-events-none"></div>
                    <Zap className={`mt-0.5 shrink-0 ${zenMode.active ? 'text-brand-300' : 'text-brand-400'}`} size={16} />
                    <div className="text-left">
                        <p className={`text-xs font-semibold ${zenMode.active ? 'text-brand-200' : 'text-brand-300'}`}>
                            {zenMode.active ? '⚡ Zen Mode ATIVO' : 'Modo Foco Zen'}
                        </p>
                        <p className="text-[10px] text-brand-200/50 mt-0.5 font-mono">
                            {zenMode.active ? 'Clique para desativar' : 'Apagar Incêndios: OFF'}
                        </p>
                    </div>
                    {zenMode.active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-400 animate-pulse" />}
                </button>

                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground w-full mb-2">
                    <Bell size={16} className="hover:text-white cursor-pointer transition-colors" />
                    <Link href="#"><Settings size={16} className="hover:text-white cursor-pointer transition-colors" /></Link>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-background">
                            G
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-green border-2 border-background"></div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Gestor</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Gestor Head</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check, Building, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Workspace {
    id: string;
    userId: string;
    agencyId: string;
    role: string;
    agency: {
        id: string;
        name: string;
        logoUrl: string | null;
    }
}

export function WorkspaceSwitcher() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);
    
    // Create new workspace modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const currentAgencyId = (session?.user as any)?.currentAgencyId;

    useEffect(() => {
        if (session) {
            fetchWorkspaces();
        }
    }, [session]);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('/api/workspace');
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitch = async (agencyId: string) => {
        if (agencyId === currentAgencyId) return;
        
        setIsSwitching(true);
        try {
            const res = await fetch('/api/workspace/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetAgencyId: agencyId })
            });

            if (res.ok) {
                // Force update the NextAuth session token locally to reflect the new agency
                await update({ currentAgencyId: agencyId });
                // Hard refresh to reload all context/store data
                window.location.href = '/'; 
            }
        } catch (error) {
            console.error("Failed to switch workspace", error);
            setIsSwitching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        
        setIsCreating(true);
        try {
            const res = await fetch('/api/agency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWorkspaceName.trim() })
            });

            if (res.ok) {
                const newAgency = await res.json();
                await update({ currentAgencyId: newAgency.id });
                window.location.href = '/'; 
            }
        } catch (error) {
            console.error("Failed to create workspace", error);
            setIsCreating(false);
        }
    };

    const currentWorkspace = workspaces.find(w => w.agency.id === currentAgencyId);

    if (isLoading) return <div className="animate-pulse h-12 bg-white/5 rounded-lg mb-3"></div>;

    return (
        <Menu as="div" className="relative w-full mb-3">
            <Menu.Button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 hover:bg-black/30 border border-card-border transition-colors group">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative shrink-0">
                        {currentWorkspace?.agency.logoUrl ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                                <img src={currentWorkspace.agency.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {currentWorkspace?.agency.name ? currentWorkspace.agency.name.substring(0, 2).toUpperCase() : 'W'}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-status-green border-2 border-background"></div>
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                            {currentWorkspace?.agency.name || 'Sem Espaço'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {workspaces.length > 1 ? `${workspaces.length} espaços disponíveis` : 'Plano Agency'}
                        </p>
                    </div>
                </div>
                <ChevronDown size={14} className="text-muted-foreground group-hover:text-white transition-colors" />
            </Menu.Button>

            <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0 -translate-y-2"
                enterTo="transform scale-100 opacity-100 translate-y-0"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100 translate-y-0"
                leaveTo="transform scale-95 opacity-0 -translate-y-2"
            >
                <Menu.Items className="absolute z-[100] left-0 bottom-full mb-2 w-full origin-bottom-left rounded-xl bg-card border border-white/10 shadow-2xl overflow-hidden focus:outline-none ring-1 ring-black ring-opacity-5">
                    <div className="p-2 space-y-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Seus Espaços
                        </div>
                        {workspaces.map((ws) => (
                            <Menu.Item key={ws.id}>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleSwitch(ws.agency.id)}
                                        disabled={isSwitching}
                                        className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors text-sm ${
                                            active ? 'bg-brand-500/10 text-white' : 'text-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {ws.agency.logoUrl ? (
                                                <img src={ws.agency.logoUrl} className="w-5 h-5 rounded-sm" alt="" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-sm bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                    {ws.agency.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="truncate">{ws.agency.name}</span>
                                        </div>
                                        {ws.agency.id === currentAgencyId && (
                                            <Check size={14} className="text-brand-500 shrink-0" />
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                    
                    <div className="border-t border-white/5 p-2 tracking-wide">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowCreateModal(true);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-sm font-medium ${
                                        active ? 'bg-white/5 text-white' : 'text-muted-foreground hover:text-white'
                                    }`}
                                >
                                    <Plus size={14} />
                                    <span>Criar novo espaço...</span>
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>

            {/* Create Workspace Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-white/10 p-5">
                        <h3 className="text-lg font-bold text-white mb-1">Criar novo espaço</h3>
                        <p className="text-sm text-muted-foreground mb-5">
                            Crie um ambiente isolado para novos clientes, tarefas e equipe.
                        </p>
                        
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Nome do Espaço
                                    </label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        placeholder="Ex: Agência Insight..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                                        disabled={isCreating}
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors"
                                        disabled={isCreating}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newWorkspaceName.trim() || isCreating}
                                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isCreating ? 'Criando...' : 'Criar Espaço'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Menu>
    );
}

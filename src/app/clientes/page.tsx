"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Edit2, ExternalLink, Activity, AlertTriangle, CheckCircle2, TrendingDown, Search } from "lucide-react";
import Link from "next/link";
import { AddClientModal } from "@/components/modals/AddClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { Client } from "@/data/mockClients";

export default function ClientesPage() {
    const clients = useAppStore(s => s.clients);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.niche.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (val: number, currency = 'BRL') =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);

    const healthConfig = {
        good: { icon: <CheckCircle2 size={16} className="text-status-green" />, label: 'Batendo Meta', color: 'text-status-green' },
        warning: { icon: <AlertTriangle size={16} className="text-status-yellow" />, label: 'Atenção', color: 'text-status-yellow' },
        critical: { icon: <TrendingDown size={16} className="text-status-red" />, label: 'Emergência', color: 'text-status-red' },
    };

    return (
        <>
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen bg-background">

                {/* Header */}
                <header className="border-b border-card-border bg-card/30 backdrop-blur-md sticky top-0 z-40 px-8 py-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                👥 Clientes & Contas
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{clients.length} clientes no sistema</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(89,115,255,0.2)]"
                        >
                            <Plus size={18} /> Novo Cliente
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mt-4 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou nicho..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/50"
                        />
                    </div>
                </header>

                {/* Grid de Clientes */}
                <div className="p-8">
                    {filtered.length === 0 && (
                        <div className="text-center py-24 text-muted-foreground">
                            <p className="text-4xl mb-4">🔍</p>
                            <p>Nenhum cliente encontrado.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(client => {
                            const pct = Math.min((client.currentSpend / client.budget) * 100, 100);
                            const h = healthConfig[client.healthStatus];
                            return (
                                <div key={client.id} className="glass-panel border border-card-border rounded-xl p-5 hover:border-brand-500/30 transition-all group">

                                    {/* Top Row */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate text-base">{client.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{client.niche}</p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ml-3 shrink-0 ${h.color}`}>
                                            {h.icon}
                                            <span className="text-xs font-medium">{h.label}</span>
                                        </div>
                                    </div>

                                    {/* Pacing */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-mono mb-1.5">
                                            <span className="text-white">{formatCurrency(client.currentSpend, client.currency)}</span>
                                            <span className="text-muted-foreground">{formatCurrency(client.budget, client.currency)}</span>
                                        </div>
                                        <div className="h-1.5 bg-card-border rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${pct > 95 ? 'bg-status-red' : pct > 80 ? 'bg-status-yellow' : 'bg-brand-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{pct.toFixed(0)}% da verba utilizada</p>
                                    </div>

                                    {/* KPIs */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-white/[0.02] p-2.5 rounded-lg border border-card-border">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CPA Meta</p>
                                            <p className="text-sm font-mono font-semibold text-white mt-0.5">{formatCurrency(client.targetCpa, client.currency)}</p>
                                        </div>
                                        <div className="bg-white/[0.02] p-2.5 rounded-lg border border-card-border">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ROAS Min.</p>
                                            <p className="text-sm font-mono font-semibold text-white mt-0.5">{client.minRoas}×</p>
                                        </div>
                                    </div>

                                    {/* Links */}
                                    {(client.adsManagerUrl || client.ga4Url || client.lookerUrl) && (
                                        <div className="flex gap-2 mb-4 flex-wrap">
                                            {client.adsManagerUrl && (
                                                <a href={client.adsManagerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-white/[0.05] border border-card-border rounded text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                                                    <ExternalLink size={10} /> Ads Manager
                                                </a>
                                            )}
                                            {client.ga4Url && (
                                                <a href={client.ga4Url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-white/[0.05] border border-card-border rounded text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                                                    <ExternalLink size={10} /> GA4
                                                </a>
                                            )}
                                            {client.lookerUrl && (
                                                <a href={client.lookerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-white/[0.05] border border-card-border rounded text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                                                    <ExternalLink size={10} /> Looker
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-card-border">
                                        <Link href={`/cockpit/${client.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300 text-xs font-medium hover:bg-brand-600/30 transition-colors">
                                            <Activity size={12} /> Abrir Cockpit
                                        </Link>
                                        <button
                                            onClick={() => setEditingClient(client)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-card-border text-muted-foreground text-xs hover:text-white hover:border-brand-500/30 transition-colors"
                                        >
                                            <Edit2 size={12} /> Editar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
            {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />}
        </>
    );
}

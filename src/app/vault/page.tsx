"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { Link2, ExternalLink, Search, LayoutGrid, Folder, Settings, Database, Filter } from "lucide-react";
import { useState } from "react";

export default function VaultPage() {
    const clients = useAppStore(s => s.clients);
    const [search, setSearch] = useState("");

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.niche.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-[#0A0A0A] text-foreground min-h-screen font-sans selection:bg-brand-500/30 w-full overflow-x-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <header className="px-8 py-7 border-b border-card-border bg-card/60 backdrop-blur-xl flex justify-between items-center z-10 shrink-0">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                            <div className="w-3 h-8 bg-brand-500 rounded-sm shadow-[0_0_15px_rgba(89,115,255,0.5)]"></div>
                            Vault (Central de Links)
                        </h1>
                        <p className="text-sm text-brand-200/60 mt-2 font-medium">Acesso rápido a todos os ativos, dashboards e gerenciadores dos seus clientes.</p>
                    </div>

                    <div className="relative w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente ou nicho..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/60 border border-card-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-muted-foreground/60 shadow-inner"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
                    {filteredClients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Database size={48} className="mb-4 opacity-20" />
                            <p>Nenhum cliente encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map(client => {
                                const hasLinks = client.adsManagerUrl || client.ga4Url || client.lookerUrl || client.driveFolderUrl;
                                
                                return (
                                    <div key={client.id} className="bg-black/40 border border-card-border rounded-xl p-5 hover:border-brand-500/30 transition-colors group flex flex-col relative overflow-hidden">
                                        
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">{client.name}</h3>
                                                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/5 rounded border border-card-border mt-1 inline-block">{client.niche}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center relative z-10">
                                            {!hasLinks ? (
                                                <div className="text-center py-6 border-2 border-dashed border-card-border/50 rounded-lg bg-white/[0.02]">
                                                    <p className="text-xs text-muted-foreground mb-2">Nenhum link configurado</p>
                                                    <span className="text-[10px] text-brand-400 font-medium">Edite o cliente no Cockpit para adicionar</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {client.adsManagerUrl && (
                                                        <a href={client.adsManagerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-card-border hover:bg-white/10 hover:border-white/20 transition-all text-sm group/link">
                                                            <div className="flex items-center gap-2.5 text-white/80 group-hover/link:text-white">
                                                                <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400"><LayoutGrid size={12}/></div>
                                                                Ads Manager
                                                            </div>
                                                            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </a>
                                                    )}
                                                    
                                                    {client.ga4Url && (
                                                        <a href={client.ga4Url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-card-border hover:bg-white/10 hover:border-white/20 transition-all text-sm group/link">
                                                            <div className="flex items-center gap-2.5 text-white/80 group-hover/link:text-white">
                                                                <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400"><Database size={12}/></div>
                                                                Google Analytics
                                                            </div>
                                                            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </a>
                                                    )}

                                                    {client.lookerUrl && (
                                                        <a href={client.lookerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-card-border hover:bg-white/10 hover:border-white/20 transition-all text-sm group/link">
                                                            <div className="flex items-center gap-2.5 text-white/80 group-hover/link:text-white">
                                                                <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400"><Filter size={12}/></div>
                                                                Looker Studio
                                                            </div>
                                                            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </a>
                                                    )}

                                                    {client.driveFolderUrl && (
                                                        <a href={client.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-card-border hover:bg-brand-500/20 hover:border-brand-500/30 transition-all text-sm group/link">
                                                            <div className="flex items-center gap-2.5 text-white/80 group-hover/link:text-brand-300">
                                                                <div className="w-6 h-6 rounded bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-400"><Folder size={12}/></div>
                                                                Pasta do Drive
                                                            </div>
                                                            <ExternalLink size={14} className="text-brand-400 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

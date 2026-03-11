"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { BarChart3, TrendingUp, DollarSign, Plus, FileText, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddCaseModal } from "@/components/modals/AddCaseModal";

export default function CasesPage() {
    const cases = useAppStore(s => s.cases);
    const deleteCase = useAppStore(s => s.deleteCase);
    const [mounted, setMounted] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCase, setEditingCase] = useState<any>(null);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="flex bg-[#0A0A0A] text-foreground min-h-screen font-sans selection:bg-brand-500/30">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto w-full">
                <header className="flex justify-between items-end mb-8 border-b border-card-border/50 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <BarChart3 className="text-brand-500" />
                            Cases dos Clientes
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Seu arsenal de vendas. Registre as estratégias que deram certo, o investimento utilizado e o retorno obtido para usar como vitrine para sua agência.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCase(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(89,115,255,0.2)] shrink-0"
                    >
                        <Plus size={16} /> Documentar Novo Case
                    </button>
                </header>

                {cases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 border border-card-border border-dashed rounded-2xl bg-white/[0.01]">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="text-brand-500" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Nenhum case registrado</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Você ainda não documentou nenhuma vitória. Salve suas melhores campanhas aqui para apresentar a futuros clientes como prova do seu diferencial.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {cases.map((c) => (
                            <div key={c.id} className="glass-panel border border-card-border rounded-xl p-6 relative group flex flex-col hover:border-brand-500/30 transition-all cursor-default">
                                <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            setEditingCase(c);
                                            setShowAddModal(true);
                                        }}
                                        className="p-1.5 bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white rounded transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => deleteCase(c.id)}
                                        className="p-1.5 bg-status-red/10 text-status-red hover:bg-status-red hover:text-white rounded transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Cliente</div>
                                    <h3 className="text-lg font-bold text-white leading-tight">{c.clientName}</h3>
                                </div>

                                <div className="p-3 bg-white/[0.03] border border-card-border/50 rounded-lg mb-4">
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Estratégia Utilizada</div>
                                    <p className="text-sm text-brand-200 font-medium font-mono break-words whitespace-pre-wrap">{c.strategy}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-5 border-b border-card-border/50 pb-5">
                                    <div>
                                        <div className="text-[10px] flex items-center gap-1 font-mono text-muted-foreground uppercase tracking-wider mb-1 whitespace-nowrap">
                                            <DollarSign size={12}/> Investimento
                                        </div>
                                        <p className="text-base font-semibold text-white">{formatCurrency(c.investment)}</p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] flex items-center gap-1 font-mono text-muted-foreground uppercase tracking-wider mb-1 whitespace-nowrap">
                                            <DollarSign size={12}/> Faturamento
                                        </div>
                                        <p className="text-base font-semibold text-white">{formatCurrency(c.revenue || 0)}</p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] flex items-center gap-1 font-mono text-muted-foreground uppercase tracking-wider mb-1">
                                            <TrendingUp size={12}/> ROI
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-xl font-black text-status-green drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{c.roi}x</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="text-[10px] flex items-center gap-1 font-mono text-muted-foreground uppercase tracking-wider mb-2">
                                        <FileText size={12}/> Anotações
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {c.notes}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-card-border/30 text-right">
                                    <span className="text-[10px] text-muted-foreground font-mono">Documentado em {new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showAddModal && <AddCaseModal onClose={() => setShowAddModal(false)} editingCase={editingCase} />}
        </div>
    );
}

"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { BarChart3, TrendingUp, Users, Activity, AlertTriangle } from "lucide-react";

export default function RelatoriosPage() {
    const clients = useAppStore(s => s.clients);
    const creatives = useAppStore(s => s.creatives);
    const decisionLogs = useAppStore(s => s.decisionLogs);

    const totalBudget = clients.reduce((s, c) => s + c.budget, 0);
    const totalSpend = clients.reduce((s, c) => s + c.currentSpend, 0);
    const avgPacing = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    const healthy = clients.filter(c => c.healthStatus === 'good').length;
    const warning = clients.filter(c => c.healthStatus === 'warning').length;
    const critical = clients.filter(c => c.healthStatus === 'critical').length;

    const fatiguedCreatives = creatives.filter(c => c.hookRate < 15 || c.status === 'fatigued').length;
    const avgHook = creatives.length ? (creatives.reduce((s, c) => s + c.hookRate, 0) / creatives.length).toFixed(1) : '0';
    const avgRoas = creatives.length ? (creatives.reduce((s, c) => s + c.roas, 0) / creatives.length).toFixed(2) : '0';

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <>
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen bg-background">
                <header className="border-b border-card-border bg-card/30 backdrop-blur-md sticky top-0 z-40 px-8 py-5">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3"><BarChart3 size={24} className="text-brand-400" /> Relatórios Inteligentes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Visão consolidada de todas as contas</p>
                </header>

                <div className="p-8 space-y-8">

                    {/* KPIs Gerais */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Performance Financeira</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass-panel border border-card-border rounded-xl p-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verba Total Gerenciada</p>
                                <p className="text-3xl font-bold font-mono text-white mt-2">{formatCurrency(totalBudget)}</p>
                                <p className="text-xs text-muted-foreground mt-2 font-mono">{clients.length} clientes ativos</p>
                            </div>
                            <div className="glass-panel border border-card-border rounded-xl p-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Gasto (Pacing)</p>
                                <p className="text-3xl font-bold font-mono text-white mt-2">{formatCurrency(totalSpend)}</p>
                                <div className="mt-3 h-1.5 bg-card-border rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${avgPacing > 90 ? 'bg-status-red' : avgPacing > 75 ? 'bg-status-yellow' : 'bg-brand-500'}`} style={{ width: `${avgPacing}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{avgPacing.toFixed(1)}% da verba geral utilizada</p>
                            </div>
                            <div className="glass-panel border border-card-border rounded-xl p-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verba Disponível</p>
                                <p className="text-3xl font-bold font-mono text-status-green mt-2">{formatCurrency(totalBudget - totalSpend)}</p>
                                <p className="text-xs text-muted-foreground mt-2 font-mono">Margem restante no ciclo</p>
                            </div>
                        </div>
                    </div>

                    {/* Health Map */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Mapa de Saúde das Contas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass-panel border border-status-green/20 rounded-xl p-6 bg-status-green/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-status-green/20 flex items-center justify-center"><Users size={20} className="text-status-green" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Saudáveis 🟢</p>
                                        <p className="text-3xl font-bold text-status-green mt-1">{healthy}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-panel border border-status-yellow/20 rounded-xl p-6 bg-status-yellow/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-status-yellow/20 flex items-center justify-center"><AlertTriangle size={20} className="text-status-yellow" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Atenção 🟡</p>
                                        <p className="text-3xl font-bold text-status-yellow mt-1">{warning}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-panel border border-status-red/20 rounded-xl p-6 bg-status-red/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-status-red/20 flex items-center justify-center"><AlertTriangle size={20} className="text-status-red" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Críticos 🔴</p>
                                        <p className="text-3xl font-bold text-status-red mt-1">{critical}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creative Performance */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Inteligência Criativa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="glass-panel border border-card-border rounded-xl p-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hook Rate Médio</p>
                                <p className={`text-3xl font-bold font-mono mt-2 ${parseFloat(avgHook) < 15 ? 'text-status-red' : 'text-white'}`}>{avgHook}%</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">Meta: {'>'}18%</p>
                            </div>
                            <div className="glass-panel border border-card-border rounded-xl p-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">ROAS Médio</p>
                                <p className="text-3xl font-bold font-mono text-white mt-2">{avgRoas}×</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{creatives.filter(c => c.roas >= 3).length} criativos acima de 3×</p>
                            </div>
                            <div className="glass-panel border border-status-red/20 rounded-xl p-6 bg-status-red/5">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Criativos Fadigados</p>
                                <p className="text-3xl font-bold font-mono text-status-red mt-2">{fatiguedCreatives}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">Hook {'<'} 15% ou status fadigado</p>
                            </div>
                        </div>
                    </div>

                    {/* Ranking de Clientes por Pacing */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Ranking por Pacing</h2>
                        <div className="glass-panel border border-card-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-muted-foreground border-b border-card-border bg-white/[0.02] uppercase font-mono tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">Cliente</th>
                                        <th className="px-6 py-3 text-left font-medium">Verba Total</th>
                                        <th className="px-6 py-3 text-left font-medium">Gasto</th>
                                        <th className="px-6 py-3 text-left font-medium">Pacing</th>
                                        <th className="px-6 py-3 text-left font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {[...clients]
                                        .sort((a, b) => (b.currentSpend / b.budget) - (a.currentSpend / a.budget))
                                        .map(c => {
                                            const pct = Math.min((c.currentSpend / c.budget) * 100, 100);
                                            return (
                                                <tr key={c.id} className="table-row-hover">
                                                    <td className="px-6 py-3 font-medium text-white">{c.name}</td>
                                                    <td className="px-6 py-3 font-mono text-muted-foreground">{formatCurrency(c.budget)}</td>
                                                    <td className="px-6 py-3 font-mono text-white">{formatCurrency(c.currentSpend)}</td>
                                                    <td className="px-6 py-3 w-48">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-card-border rounded-full overflow-hidden">
                                                                <div className={`h-full ${pct > 90 ? 'bg-status-red' : pct > 75 ? 'bg-status-yellow' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="text-xs font-mono text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={`text-xs font-medium ${c.healthStatus === 'good' ? 'text-status-green' : c.healthStatus === 'warning' ? 'text-status-yellow' : 'text-status-red'}`}>
                                                            {c.healthStatus === 'good' ? '🟢 OK' : c.healthStatus === 'warning' ? '🟡 Alerta' : '🔴 Crítico'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Histórico de Decisões */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Últimas Decisões Estratégicas</h2>
                        <div className="space-y-3">
                            {decisionLogs.slice(0, 8).map(log => {
                                const client = clients.find(c => c.id === log.clientId);
                                return (
                                    <div key={log.id} className="glass-panel border border-card-border rounded-xl p-4 flex gap-4 items-start">
                                        <div className="shrink-0 w-1.5 h-full min-h-[40px] rounded-full bg-brand-500/40 mt-1"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{log.title}</p>
                                                    <p className="text-xs text-brand-300 font-mono mt-0.5">{client?.name || 'Cliente desconhecido'}</p>
                                                </div>
                                                <time className="text-[10px] text-muted-foreground font-mono shrink-0">{new Date(log.date).toLocaleDateString('pt-BR')}</time>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{log.hypothesis}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {decisionLogs.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Nenhuma decisão registrada ainda.</p>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}

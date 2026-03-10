"use client";

import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, CheckCircle2, TrendingDown, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ClientTableProps {
    filter?: 'all' | 'critical' | 'warning' | 'good';
}

export function ClientTable({ filter = 'all' }: ClientTableProps) {
    const clients = useAppStore((state) => state.clients);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const displayed = filter === 'all' ? clients : clients.filter(c => c.healthStatus === filter);

    const renderPacingBar = (spend: number, budget: number) => {
        const percentage = Math.min((spend / budget) * 100, 100);
        const isCritical = spend / budget > 0.95;
        const isWarning = spend / budget > 0.80;
        return (
            <div className="w-full space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                    <span className={isCritical ? "text-status-red" : "text-muted-foreground"}>{formatCurrency(spend)}</span>
                    <span className="text-muted-foreground">{formatCurrency(budget)}</span>
                </div>
                <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-status-red' : isWarning ? 'bg-status-yellow' : 'bg-brand-500'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    const getHealthIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle2 size={16} className="text-status-green drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />;
            case 'warning': return <AlertTriangle size={16} className="text-status-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
            case 'critical': return <TrendingDown size={16} className="text-status-red drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
            default: return null;
        }
    };

    if (!mounted) {
        return (
            <div className="glass-panel rounded-xl overflow-hidden mt-6 h-96 flex items-center justify-center">
                <RefreshCcw className="animate-spin text-brand-500 opacity-50" size={32} />
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-xl overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-white/[0.02] text-muted-foreground border-b border-card-border font-mono tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Cliente & Saúde</th>
                            <th className="px-6 py-4 font-medium w-64">Pacing (Verba)</th>
                            <th className="px-6 py-4 font-medium">Última Otim.</th>
                            <th className="px-6 py-4 font-medium min-w-[280px]">Insight Atual</th>
                            <th className="px-6 py-4 font-medium text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {displayed.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-muted-foreground">
                                    {filter !== 'all' ? 'Nenhum cliente com esse status.' : 'Nenhum cliente cadastrado.'}
                                </td>
                            </tr>
                        )}
                        {displayed.map((client) => (
                            <tr key={client.id} className="table-row-hover group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="mt-0.5">{getHealthIcon(client.healthStatus)}</div>
                                        <div>
                                            <div className="font-semibold text-foreground group-hover:text-brand-300 transition-colors">
                                                {client.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{client.niche}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {renderPacingBar(client.currentSpend, client.budget)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium font-mono ${client.lastOptimization === 'Agora mesmo' ? 'bg-status-green/20 text-status-green border border-status-green/30' : 'bg-white/[0.05] text-muted-foreground'}`}>
                                        {client.lastOptimization}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-muted-foreground leading-relaxed">
                                    <div className="line-clamp-2 pr-4 pl-2 border-l-2 border-brand-500/30 max-w-xs">
                                        {client.pendingInsight || "Nenhum insight pendente."}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <Link
                                        href={`/cockpit/${client.id}`}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-brand-600 hover:bg-brand-500 text-white shadow px-4 py-2 opacity-0 group-hover:opacity-100 h-8"
                                    >
                                        Abrir Cockpit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { ClientTable } from "@/components/layout/ClientTable";
import { AddClientModal } from "@/components/modals/AddClientModal";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Filter } from "lucide-react";

export default function Home() {
  const clients = useAppStore(s => s.clients);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all');

  const good = clients.filter(c => c.healthStatus === 'good').length;
  const warning = clients.filter(c => c.healthStatus === 'warning').length;
  const critical = clients.filter(c => c.healthStatus === 'critical').length;
  const totalSpend = clients.reduce((acc, c) => acc + c.currentSpend, 0);

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Visão Geral</h1>
              <p className="text-sm text-muted-foreground">
                Comando central operacional.{" "}
                <span className="text-brand-400 font-medium">{clients.length} clientes ativos</span>
                {critical > 0 && (
                  <span className="ml-2 text-status-red font-medium">· {critical} crítico{critical > 1 ? 's' : ''} ⚠️</span>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              {/* Filtro Rápido */}
              <div className="flex gap-1 p-1 bg-white/[0.03] border border-card-border rounded-lg">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'critical', label: '🔴' },
                  { key: 'warning', label: '🟡' },
                  { key: 'good', label: '🟢' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === f.key
                        ? 'bg-brand-600 text-white'
                        : 'text-muted-foreground hover:text-white'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors shadow-[0_0_15px_rgba(89,115,255,0.3)]"
              >
                <Plus size={16} /> Nova Conta
              </button>
            </div>
          </header>

          {/* Health Status Map */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card/40 border border-card-border p-5 rounded-xl flex flex-col justify-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Investido (Moeda Local) </p>
              <p className="text-2xl font-mono text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpend)}
              </p>
            </div>
            
            <button onClick={() => setFilter('good')} className={`bg-status-green/10 border ${filter === 'good' ? 'border-status-green ring-1 ring-status-green/50' : 'border-status-green/20 hover:border-status-green/40'} p-5 rounded-xl transition-all text-left flex flex-col justify-between`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-status-green shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                <p className="text-xs font-semibold text-status-green uppercase tracking-wider">Batendo Meta</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{good}</span>
                <span className="text-sm text-status-green/70 mb-1">contas</span>
              </div>
            </button>

            <button onClick={() => setFilter('warning')} className={`bg-status-yellow/10 border ${filter === 'warning' ? 'border-status-yellow ring-1 ring-status-yellow/50' : 'border-status-yellow/20 hover:border-status-yellow/40'} p-5 rounded-xl transition-all text-left flex flex-col justify-between`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-status-yellow shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                <p className="text-xs font-semibold text-status-yellow uppercase tracking-wider">Atenção / Alerta</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{warning}</span>
                <span className="text-sm text-status-yellow/70 mb-1">contas</span>
              </div>
            </button>

            <button onClick={() => setFilter('critical')} className={`bg-status-red/10 border ${filter === 'critical' ? 'border-status-red ring-1 ring-status-red/50' : 'border-status-red/20 hover:border-status-red/40'} p-5 rounded-xl transition-all text-left flex flex-col justify-between relative overflow-hidden`}>
              {critical > 0 && <div className="absolute -right-4 -top-4 w-16 h-16 bg-status-red/20 blur-xl rounded-full"></div>}
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-status-red shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                <p className="text-xs font-semibold text-status-red uppercase tracking-wider">Crítico / Fora da Meta</p>
              </div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-bold text-white">{critical}</span>
                <span className="text-sm text-status-red/70 mb-1">contas</span>
              </div>
            </button>
          </section>

          <ClientTable filter={filter} />
        </div>
      </main>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
    </>
  );
}

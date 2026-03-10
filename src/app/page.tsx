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

  const critical = clients.filter(c => c.healthStatus === 'critical').length;

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
              <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">The Tower</h1>
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

          <ClientTable filter={filter} />
        </div>
      </main>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
    </>
  );
}

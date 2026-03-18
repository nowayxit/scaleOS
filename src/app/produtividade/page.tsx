"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BarChart2, Users, CheckCircle2, Clock, TrendingUp, Zap, AlertTriangle, HeartPulse, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Stats {
  period: number;
  healthSummary: { critical: number; warning: number; good: number; total: number };
  completedTasks: number;
  quickTasks: number;
  longTasks: number;
  avgDuration: number | null;
  members: Array<{
    userId: string;
    name: string | null;
    role: string;
    clients: { critical: number; warning: number; good: number; total: number };
    completedTasksCount: number;
  }>;
  clients: Array<{ id: string; name: string; healthStatus: string }>;
}

const PERIODS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

const healthColor: Record<string, string> = {
  critical: "text-red-400",
  warning: "text-yellow-400",
  good: "text-green-400",
};

const healthBg: Record<string, string> = {
  critical: "bg-red-500/10 border-red-500/20",
  warning: "bg-yellow-500/10 border-yellow-500/20",
  good: "bg-green-500/10 border-green-500/20",
};

const healthLabel: Record<string, string> = {
  critical: "Crítico",
  warning: "Atenção",
  good: "Saudável",
};

function StatCard({ icon, label, value, sub, color = "brand" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-white/8 p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400`}>{icon}</span>
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function ProdutividadePage() {
  const [period, setPeriod] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchStats(days: number) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/produtividade?days=${days}`);
      if (res.ok) setStats(await res.json());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchStats(period); }, [period]);

  const healthBarWidth = (n: number) =>
    stats && stats.healthSummary.total > 0 ? `${(n / stats.healthSummary.total) * 100}%` : "0%";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                <BarChart2 size={20} className="text-brand-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard de Produtividade</h1>
                <p className="text-sm text-muted-foreground">Performance da equipe e saúde dos clientes.</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1 gap-1">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === p.value
                      ? "bg-brand-600 text-white shadow"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<CheckCircle2 size={16} />}
                  label="Tasks Concluídas"
                  value={stats.completedTasks}
                  sub={`últimos ${period} dias`}
                  color="brand"
                />
                <StatCard
                  icon={<Zap size={16} />}
                  label="Tasks Rápidas"
                  value={stats.quickTasks}
                  sub="concluídas em até 2 dias"
                  color="green"
                />
                <StatCard
                  icon={<Clock size={16} />}
                  label="Tasks Longas"
                  value={stats.longTasks}
                  sub="mais de 2 dias"
                  color="yellow"
                />
                <StatCard
                  icon={<TrendingUp size={16} />}
                  label="Média de Duração"
                  value={stats.avgDuration !== null ? `${stats.avgDuration.toFixed(1)} dias` : "—"}
                  sub="por task"
                  color="brand"
                />
              </div>

              {/* Health Bar */}
              <div className="bg-card rounded-2xl border border-white/8 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <HeartPulse size={16} className="text-brand-400" />
                  <h2 className="text-sm font-semibold text-white">Saúde dos Clientes — {stats.healthSummary.total} clientes</h2>
                </div>

                <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
                  {stats.healthSummary.critical > 0 && (
                    <div className="bg-red-500 transition-all" style={{ width: healthBarWidth(stats.healthSummary.critical) }} title="Críticos" />
                  )}
                  {stats.healthSummary.warning > 0 && (
                    <div className="bg-yellow-500 transition-all" style={{ width: healthBarWidth(stats.healthSummary.warning) }} title="Atenção" />
                  )}
                  {stats.healthSummary.good > 0 && (
                    <div className="bg-green-500 transition-all" style={{ width: healthBarWidth(stats.healthSummary.good) }} title="Saudáveis" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(["critical", "warning", "good"] as const).map(status => (
                    <div key={status} className={`rounded-xl border p-4 ${healthBg[status]}`}>
                      <p className={`text-2xl font-bold ${healthColor[status]}`}>{stats.healthSummary[status]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{healthLabel[status]}</p>
                    </div>
                  ))}
                </div>

                {/* Individual clients */}
                {stats.clients.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {stats.clients.map(client => (
                      <div key={client.id} className="flex items-center gap-2 bg-white/3 rounded-xl px-3 py-2 border border-white/5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          client.healthStatus === "critical" ? "bg-red-500" :
                          client.healthStatus === "warning" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <span className="text-xs text-white truncate">{client.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members Cards */}
              <div>
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  Performance por Gestor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.members.map(member => (
                    <div key={member.userId} className="bg-card rounded-2xl border border-white/8 p-5 space-y-4">
                      {/* Member header */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center text-sm font-bold text-brand-300">
                          {member.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role.toLowerCase()}</p>
                        </div>
                      </div>

                      {/* Health mini-stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 py-2">
                          <p className="text-lg font-bold text-red-400">{member.clients.critical}</p>
                          <p className="text-xs text-muted-foreground">Críticos</p>
                        </div>
                        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 py-2">
                          <p className="text-lg font-bold text-yellow-400">{member.clients.warning}</p>
                          <p className="text-xs text-muted-foreground">Atenção</p>
                        </div>
                        <div className="rounded-xl bg-green-500/10 border border-green-500/20 py-2">
                          <p className="text-lg font-bold text-green-400">{member.clients.good}</p>
                          <p className="text-xs text-muted-foreground">Saudáveis</p>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 border border-white/5">
                        <span className="text-xs text-muted-foreground">Tasks concluídas</span>
                        <span className="text-sm font-bold text-white">{member.completedTasksCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <AlertTriangle size={28} />
              <p>Não foi possível carregar os dados.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

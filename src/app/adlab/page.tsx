"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Trash2, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

const STATUS_MAP = {
    active: { label: '✅ Ativo', color: 'text-status-green bg-status-green/10 border-status-green/20' },
    paused: { label: '⏸️ Pausado', color: 'text-muted-foreground bg-white/[0.03] border-card-border' },
    fatigued: { label: '🔴 Fadigado', color: 'text-status-red bg-status-red/10 border-status-red/20' },
};

const TYPE_MAP: Record<string, string> = {
    video: '🎥 Vídeo',
    static: '🖼️ Estático',
    ugc: '👤 UGC',
    carousel: '🎠 Carousel',
};

interface AddCreativeForm {
    name: string;
    type: string;
    hookRate: string;
    holdRate: string;
    ctr: string;
    roas: string;
    cpm: string;
    clientId: string;
}

export default function AdLabPage() {
    const clients = useAppStore(s => s.clients);
    const creatives = useAppStore(s => s.creatives);
    const addCreative = useAppStore(s => s.addCreative);
    const updateCreative = useAppStore(s => s.updateCreative);
    const deleteCreative = useAppStore(s => s.deleteCreative);

    const [selectedClient, setSelectedClient] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<AddCreativeForm>({
        name: '', type: 'video', hookRate: '', holdRate: '', ctr: '', roas: '', cpm: '', clientId: clients[0]?.id || '',
    });

    const filtered = selectedClient === 'all'
        ? creatives
        : creatives.filter(c => c.clientId === selectedClient);

    const handleAdd = () => {
        if (!form.name || !form.clientId) return;
        addCreative({
            name: form.name,
            type: form.type as 'video' | 'static' | 'ugc' | 'carousel',
            hookRate: parseFloat(form.hookRate) || 0,
            holdRate: parseFloat(form.holdRate) || 0,
            ctr: parseFloat(form.ctr) || 0,
            roas: parseFloat(form.roas) || 0,
            cpm: parseFloat(form.cpm) || 0,
            clientId: form.clientId,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        });
        setForm({ name: '', type: 'video', hookRate: '', holdRate: '', ctr: '', roas: '', cpm: '', clientId: form.clientId });
        setShowAdd(false);
    };

    const stats = {
        total: filtered.length,
        active: filtered.filter(c => c.status === 'active').length,
        fatigued: filtered.filter(c => c.status === 'fatigued').length,
        avgHook: filtered.length ? (filtered.reduce((s, c) => s + c.hookRate, 0) / filtered.length).toFixed(1) : '0',
    };

    return (
        <>
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen bg-background">

                <header className="border-b border-card-border bg-card/30 backdrop-blur-md sticky top-0 z-40 px-8 py-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">🎨 The Ad Lab</h1>
                            <p className="text-sm text-muted-foreground mt-1">Controle de performance criativa</p>
                        </div>
                        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(89,115,255,0.2)]">
                            <Plus size={18} /> Novo Criativo
                        </button>
                    </div>

                    {/* Filter by client */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                            onClick={() => setSelectedClient('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedClient === 'all' ? 'bg-brand-600 text-white' : 'bg-white/[0.05] text-muted-foreground hover:text-white border border-card-border'}`}
                        >
                            Todos
                        </button>
                        {clients.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedClient(c.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedClient === c.id ? 'bg-brand-600 text-white' : 'bg-white/[0.05] text-muted-foreground hover:text-white border border-card-border'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-8 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total Criativos', value: stats.total, icon: <Activity size={18} className="text-brand-400" /> },
                            { label: 'Ativos', value: stats.active, icon: <CheckCircle2 size={18} className="text-status-green" /> },
                            { label: 'Fadigados 🔴', value: stats.fatigued, icon: <AlertTriangle size={18} className="text-status-red" /> },
                            { label: 'Hook Rate Médio', value: `${stats.avgHook}%`, icon: <Activity size={18} className="text-status-yellow" /> },
                        ].map((s) => (
                            <div key={s.label} className="glass-panel border border-card-border rounded-xl p-4">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
                                    {s.icon}
                                </div>
                                <p className="text-2xl font-bold font-mono text-white mt-2">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Add Form */}
                    {showAdd && (
                        <div className="glass-panel border border-brand-500/30 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-brand-300 mb-4 uppercase tracking-wider">Cadastrar Novo Criativo</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Nome do Criativo</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: UGC Depoimento - Versão 2" className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Tipo</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                                        <option value="video">🎥 Vídeo</option>
                                        <option value="static">🖼️ Estático</option>
                                        <option value="ugc">👤 UGC</option>
                                        <option value="carousel">🎠 Carousel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Cliente</label>
                                    <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                {[
                                    { label: 'Hook Rate (%)', key: 'hookRate' },
                                    { label: 'Hold Rate (%)', key: 'holdRate' },
                                    { label: 'CTR (%)', key: 'ctr' },
                                    { label: 'ROAS (×)', key: 'roas' },
                                    { label: 'CPM (R$)', key: 'cpm' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">{f.label}</label>
                                        <input
                                            type="number"
                                            value={form[f.key as keyof AddCreativeForm]}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            placeholder="0"
                                            className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                                        />
                                    </div>
                                ))}
                                <div className="col-span-4 flex gap-2 justify-end pt-2 border-t border-card-border">
                                    <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors">Cancelar</button>
                                    <button onClick={handleAdd} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors">Salvar Criativo</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="glass-panel border border-card-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-muted-foreground border-b border-card-border bg-white/[0.02] font-mono tracking-wider">
                                <tr>
                                    <th className="px-5 py-4 text-left font-medium">Criativo</th>
                                    <th className="px-5 py-4 text-left font-medium">Cliente</th>
                                    <th className="px-5 py-4 text-center font-medium">Hook %</th>
                                    <th className="px-5 py-4 text-center font-medium">Hold %</th>
                                    <th className="px-5 py-4 text-center font-medium">CTR %</th>
                                    <th className="px-5 py-4 text-center font-medium">ROAS</th>
                                    <th className="px-5 py-4 text-center font-medium">Status</th>
                                    <th className="px-5 py-4 text-center font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Nenhum criativo cadastrado.</td></tr>
                                )}
                                {filtered.map(cr => {
                                    const client = clients.find(c => c.id === cr.clientId);
                                    const isFatigued = cr.hookRate < 15 || cr.status === 'fatigued';
                                    const statusCfg = STATUS_MAP[cr.status] || STATUS_MAP.active;
                                    return (
                                        <tr key={cr.id} className="table-row-hover group">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-white">{cr.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{TYPE_MAP[cr.type] || cr.type}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-muted-foreground">{client?.name || '-'}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`font-mono font-bold text-sm ${cr.hookRate < 15 ? 'text-status-red' : cr.hookRate >= 20 ? 'text-status-green' : 'text-status-yellow'}`}>
                                                    {cr.hookRate}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono text-sm text-white">{cr.holdRate}%</td>
                                            <td className="px-5 py-4 text-center font-mono text-sm text-white">{cr.ctr}%</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`font-mono font-bold text-sm ${cr.roas >= 3 ? 'text-status-green' : cr.roas >= 1.5 ? 'text-status-yellow' : 'text-status-red'}`}>
                                                    {cr.roas}×
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <select
                                                    value={cr.status}
                                                    onChange={(e) => updateCreative(cr.id, { status: e.target.value as 'active' | 'paused' | 'fatigued' })}
                                                    className={`text-xs px-2 py-1 rounded border font-medium bg-transparent cursor-pointer focus:outline-none ${statusCfg.color}`}
                                                >
                                                    <option value="active">✅ Ativo</option>
                                                    <option value="paused">⏸️ Pausado</option>
                                                    <option value="fatigued">🔴 Fadigado</option>
                                                </select>
                                                {isFatigued && cr.status === 'active' && (
                                                    <p className="text-[10px] text-status-red mt-1 font-mono">⚠ Hook baixo!</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button onClick={() => deleteCreative(cr.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-status-red/20 hover:text-status-red text-muted-foreground rounded transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}

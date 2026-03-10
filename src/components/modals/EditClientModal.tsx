"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Client } from "@/data/mockClients";
import { X, Save, Trash2, AlertTriangle } from "lucide-react";

interface EditClientModalProps {
    client: Client;
    onClose: () => void;
}

export function EditClientModal({ client, onClose }: EditClientModalProps) {
    const updateClient = useAppStore(s => s.updateClient);
    const deleteClient = useAppStore(s => s.deleteClient);

    const [form, setForm] = useState({
        name: client.name,
        niche: client.niche,
        budget: String(client.budget),
        currentSpend: String(client.currentSpend),
        targetCpa: String(client.targetCpa),
        minRoas: String(client.minRoas),
        healthStatus: client.healthStatus,
        currency: client.currency,
        adsManagerUrl: client.adsManagerUrl || '',
        ga4Url: client.ga4Url || '',
        lookerUrl: client.lookerUrl || '',
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = () => {
        updateClient(client.id, {
            name: form.name,
            niche: form.niche,
            budget: parseFloat(form.budget) || 0,
            currentSpend: parseFloat(form.currentSpend) || 0,
            targetCpa: parseFloat(form.targetCpa) || 0,
            minRoas: parseFloat(form.minRoas) || 0,
            healthStatus: form.healthStatus as Client['healthStatus'],
            currency: form.currency,
            adsManagerUrl: form.adsManagerUrl,
            ga4Url: form.ga4Url,
            lookerUrl: form.lookerUrl,
        });
        onClose();
    };

    const handleDelete = () => {
        deleteClient(client.id);
        onClose();
    };

    const field = (label: string, key: keyof typeof form, type = 'text', prefix?: string) => (
        <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
                <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={`w-full bg-background border border-card-border rounded-lg py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40 ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl glass-panel border border-card-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">Editar Cliente</h2>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{client.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                        <X size={18} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Informações Básicas */}
                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Informações Básicas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Nome do Cliente', 'name')}
                            {field('Nicho / Segmento', 'niche')}
                        </div>
                    </div>

                    {/* Financeiro */}
                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Gerenciamento de Verba</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Verba Mensal (Budget)', 'budget', 'number', 'R$')}
                            {field('Gasto Atual (Pacing)', 'currentSpend', 'number', 'R$')}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Moeda</label>
                                <select
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                    className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value="BRL">BRL (R$)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status de Saúde</label>
                                <select
                                    value={form.healthStatus}
                                    onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })}
                                    className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value="good">🟢 Batendo Meta</option>
                                    <option value="warning">🟡 Atenção / Alerta</option>
                                    <option value="critical">🔴 Emergência / KPI Fora</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">KPIs Alvo</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('CPA Desejado', 'targetCpa', 'number', 'R$')}
                            {field('ROAS Mínimo', 'minRoas', 'number', '×')}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Links de Acesso Rápido</h3>
                        <div className="space-y-3">
                            {field('URL do Ads Manager (Meta/Google)', 'adsManagerUrl')}
                            {field('URL do GA4', 'ga4Url')}
                            {field('URL do Looker Studio / Report', 'lookerUrl')}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-status-red/20 rounded-xl p-4 bg-status-red/5">
                        <h3 className="text-sm font-semibold text-status-red mb-3 flex items-center gap-2">
                            <AlertTriangle size={14} /> Zona de Perigo
                        </h3>
                        {!confirmDelete ? (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="text-sm text-status-red hover:text-white hover:bg-status-red/20 px-4 py-2 rounded-lg border border-status-red/30 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Excluir este Cliente permanentemente
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Tem certeza? Esta ação é irreversível.</p>
                                <div className="flex gap-2">
                                    <button onClick={handleDelete} className="px-4 py-2 bg-status-red text-white text-sm rounded-lg font-medium hover:bg-red-600 transition-colors">
                                        Sim, excluir definitivamente
                                    </button>
                                    <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm rounded-lg border border-card-border text-muted-foreground hover:text-white transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-card-border flex-shrink-0 bg-card/30">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-card-border text-muted-foreground hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(89,115,255,0.2)]"
                    >
                        <Save size={15} /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, Save } from "lucide-react";

interface AddClientModalProps {
    onClose: () => void;
}

const emptyForm = {
    name: '',
    niche: '',
    budget: '',
    currentSpend: '0',
    currency: 'BRL',
    targetCpa: '',
    minRoas: '',
    healthStatus: 'good',
    adsManagerUrl: '',
    ga4Url: '',
    lookerUrl: '',
    lastOptimization: 'Nunca',
    nextReviewDate: '',
    pendingInsight: '',
    onboardingDate: new Date().toISOString().split('T')[0],
};

export function AddClientModal({ onClose }: AddClientModalProps) {
    const addClient = useAppStore(s => s.addClient);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Nome obrigatório';
        if (!form.niche.trim()) e.niche = 'Nicho obrigatório';
        if (!form.budget || isNaN(Number(form.budget))) e.budget = 'Verba inválida';
        if (!form.targetCpa || isNaN(Number(form.targetCpa))) e.targetCpa = 'CPA inválido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        addClient({
            name: form.name,
            niche: form.niche,
            budget: parseFloat(form.budget),
            currentSpend: parseFloat(form.currentSpend) || 0,
            currency: form.currency,
            targetCpa: parseFloat(form.targetCpa),
            minRoas: parseFloat(form.minRoas) || 0,
            healthStatus: form.healthStatus as 'good' | 'warning' | 'critical',
            adsManagerUrl: form.adsManagerUrl,
            ga4Url: form.ga4Url,
            lookerUrl: form.lookerUrl,
            lastOptimization: 'Nunca',
            nextReviewDate: form.nextReviewDate || new Date().toISOString().split('T')[0],
            pendingInsight: '',
            onboardingDate: form.onboardingDate,
        });
        onClose();
    };

    const field = (label: string, key: keyof typeof form, type = 'text', prefix?: string, placeholder?: string) => (
        <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={`w-full bg-background border ${errors[key] ? 'border-status-red' : 'border-card-border'} rounded-lg py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40 ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
                />
            </div>
            {errors[key] && <p className="text-xs text-status-red mt-1">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl glass-panel border border-card-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">Novo Cliente</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados para adicionar ao sistema</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                        <X size={18} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Informações Básicas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Nome do Cliente / Empresa', 'name', 'text', undefined, 'Ex: Clínica Saúde Total')}
                            {field('Nicho / Segmento', 'niche', 'text', undefined, 'Ex: Saúde, E-commerce...')}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Verba e KPIs</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Verba Mensal (Budget)', 'budget', 'number', 'R$', '0')}
                            {field('Gasto Atual', 'currentSpend', 'number', 'R$', '0')}
                            {field('CPA Desejado', 'targetCpa', 'number', 'R$', '0')}
                            {field('ROAS Mínimo', 'minRoas', 'number', '×', '0')}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Moeda</label>
                                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                                    <option value="BRL">BRL (R$)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status de Saúde</label>
                                <select value={form.healthStatus} onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })} className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                                    <option value="good">🟢 Batendo Meta</option>
                                    <option value="warning">🟡 Atenção / Alerta</option>
                                    <option value="critical">🔴 Emergência / KPI Fora</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-brand-300 mb-4 uppercase tracking-wider">Links de Acesso Rápido (Opcional)</h3>
                        <div className="space-y-3">
                            {field('URL do Ads Manager (Meta/Google)', 'adsManagerUrl', 'url', undefined, 'https://...')}
                            {field('URL do GA4', 'ga4Url', 'url', undefined, 'https://analytics.google.com/...')}
                            {field('URL do Looker Studio', 'lookerUrl', 'url', undefined, 'https://lookerstudio.google.com/...')}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-card-border flex-shrink-0 bg-card/30">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-card-border text-muted-foreground hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(89,115,255,0.2)]">
                        <Save size={15} /> Criar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
}

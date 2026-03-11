"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, Save } from "lucide-react";

interface AddCaseModalProps {
    onClose: () => void;
    editingCase?: any; // To allow editing later
}

export function AddCaseModal({ onClose, editingCase }: AddCaseModalProps) {
    const addCase = useAppStore(s => s.addCase);
    const updateCase = useAppStore(s => s.updateCase);
    const clients = useAppStore(s => s.clients);
    
    const [clientName, setClientName] = useState(editingCase?.clientName || clients[0]?.name || '');
    const [strategy, setStrategy] = useState(editingCase?.strategy || '');
    const [investment, setInvestment] = useState(editingCase?.investment?.toString() || '');
    const [revenue, setRevenue] = useState(editingCase?.revenue?.toString() || '');
    const [notes, setNotes] = useState(editingCase?.notes || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-calculate ROI
    const investmentNum = parseFloat(investment) || 0;
    const revenueNum = parseFloat(revenue) || 0;
    const calculatedRoi = investmentNum > 0 ? (revenueNum / investmentNum).toFixed(2) : '0.00';

    const validate = () => {
        const e: Record<string, string> = {};
        if (!clientName.trim()) e.clientName = 'Obrigatório';
        if (!strategy.trim()) e.strategy = 'Obrigatório';
        if (!investment || isNaN(Number(investment))) e.investment = 'Investimento inválido';
        if (!revenue || isNaN(Number(revenue))) e.revenue = 'Faturamento inválido';
        if (!notes.trim()) e.notes = 'Obrigatório';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        
        const matchedClient = clients.find(c => c.name === clientName);
        const payload = {
            clientId: matchedClient?.id || null,
            clientName,
            strategy,
            investment: parseFloat(investment),
            revenue: parseFloat(revenue),
            roi: parseFloat(calculatedRoi),
            notes
        };

        if (editingCase?.id) {
            updateCase(editingCase.id, payload);
        } else {
            addCase(payload);
        }
        
        onClose();
    };

    const field = (label: string, value: string, setValue: (v: string) => void, error: string, type = 'text', prefix?: string, placeholder?: string, disabled = false) => (
        <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    className={`w-full ${disabled ? 'bg-background/50 cursor-not-allowed opacity-70' : 'bg-background'} border ${error ? 'border-status-red' : 'border-card-border'} rounded-lg py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40 ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
                />
            </div>
            {error && <p className="text-xs text-status-red mt-1">{error}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg glass-panel border border-card-border rounded-2xl shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">{editingCase ? 'Editar Case' : 'Novo Case de Sucesso'}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">{editingCase ? 'Corrija as informações do case.' : 'Registre os resultados de uma estratégia matadora.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                        <X size={18} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cliente</label>
                        <select 
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                            <option value="">Selecione ou digite...</option>
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        {/* Fallback to custom input if client not in list */}
                        <input
                            type="text"
                            placeholder="Buscar ou digitar nome livre..."
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="mt-2 w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                        />
                         {errors.clientName && <p className="text-xs text-status-red mt-1">{errors.clientName}</p>}
                    </div>

                    {field('Estratégia Utilizada', strategy, setStrategy, errors.strategy, 'text', undefined, 'Ex: Funil VSL + Remarketing WhatsApp')}
                    
                    <div className="grid grid-cols-3 gap-4">
                        {field('Investimento', investment, setInvestment, errors.investment, 'number', 'R$', '0')}
                        {field('Faturamento', revenue, setRevenue, errors.revenue, 'number', 'R$', '0')}
                        {field('ROI (Automático)', calculatedRoi, () => {}, '', 'text', '×', '0.00', true)}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Anotações / Como Explicar</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Qual foi o gancho principal? Qual a oferta? Descreva por que deu tão certo..."
                            className={`w-full bg-background border ${errors.notes ? 'border-status-red' : 'border-card-border'} rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none h-24`}
                        />
                        {errors.notes && <p className="text-xs text-status-red mt-1">{errors.notes}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-card-border flex-shrink-0 bg-card/30">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-card-border text-muted-foreground hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(89,115,255,0.2)]">
                        <Save size={15} /> Salvar Case
                    </button>
                </div>
            </div>
        </div>
    );
}

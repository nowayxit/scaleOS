"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Building2, Save, Users, CreditCard, ShieldCheck, Loader2, Upload, ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";

export default function ConfiguracoesPage() {
    const { data: session, update } = useSession();
    const updateAgency = useAppStore(state => state.updateAgency);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [agencyData, setAgencyData] = useState<any>(null);
    
    // Form States
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [routines, setRoutines] = useState<{label: string, platform: 'meta' | 'google' | 'geral'}[]>([]);
    const [newRoutineLabel, setNewRoutineLabel] = useState("");
    const [newRoutinePlatform, setNewRoutinePlatform] = useState<'meta' | 'google' | 'geral'>('meta');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchAgency() {
            try {
                const res = await fetch('/api/agency');
                if (res.ok) {
                    const data = await res.json();
                    setAgencyData(data);
                    setName(data.name || '');
                    setLogoUrl(data.logoUrl || '');
                    
                    if (data.defaultRoutines) {
                        try {
                            setRoutines(JSON.parse(data.defaultRoutines));
                        } catch(e) { console.error("Could not parse routines", e); }
                    }

                    // Sync initial DB state to local store for Sidebar
                    updateAgency({ logoUrl: data.logoUrl || '' });
                }
            } catch (err) {
                console.error("Error fetching agency config:", err);
            } finally {
                setIsLoadingData(false);
            }
        }
        
        if (session?.user) {
            fetchAgency();
        }
    }, [session]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/agency', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, logoUrl, defaultRoutines: JSON.stringify(routines) })
            });

            if (res.ok) {
                // Important: Update NextAuth session so the Sidebar name flashes without reload
                await update({ name });
                // Push logo string to Zustand store so sidebar avatar picks it up instantly
                updateAgency({ logoUrl });
                alert("Configurações salvas com sucesso!");
            } else {
                alert("Erro ao salvar opções.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB to avoid huge Base64 strings in DB)
            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem não pode ter mais que 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex bg-[#0A0A0A] text-foreground min-h-screen">
                <Sidebar />
                <main className="flex-1 ml-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-500" size={32} />
                </main>
            </div>
        );
    }

    const clientsCount = agencyData?._count?.clients || 0;
    const maxSeats = agencyData?.maxSeats || 10;
    const usagePercentage = Math.min((clientsCount / maxSeats) * 100, 100);

    return (
        <div className="flex bg-[#0A0A0A] text-foreground min-h-screen font-sans selection:bg-brand-500/30">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 max-w-5xl mx-auto w-full">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Configurações da Agência</h1>
                    <p className="text-muted-foreground">Gerencie o perfil da sua agência, limites do plano e membros pagos.</p>
                </header>

                <div className="space-y-6">
                    {/* Perfil Section */}
                    <section className="bg-black/20 border border-card-border rounded-xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Building2 className="text-brand-500" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Perfil da Agência / Workspace</h2>
                                <p className="text-sm text-muted-foreground">Informações públicas que seus clientes verão.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Nome da Agência</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-card-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Logo da Agência</label>
                                <div className="flex items-center gap-4">
                                    {/* Preview Block */}
                                    <div className="w-16 h-16 rounded-xl bg-black/40 border border-card-border flex items-center justify-center overflow-hidden shrink-0">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground/50" size={24} />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 border border-card-border text-white text-sm py-2.5 rounded-lg transition-colors"
                                        >
                                            <Upload size={16} /> Fazer upload de imagem
                                        </button>
                                        <p className="text-[10px] text-muted-foreground mt-2">Formatos: JPG, PNG, WebP. Tamanho máximo: 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(89,115,255,0.2)] disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                {isSaving ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </section>

                    {/* Routine Templates */}
                    <section className="bg-black/20 border border-card-border rounded-xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <ShieldCheck className="text-brand-500" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Templates de Rotina Padrão</h2>
                                <p className="text-sm text-muted-foreground">Estes itens serão adicionados a todos os novos clientes cadastrados.</p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-brand-500/20 flex flex-wrap gap-2">
                            <input
                                value={newRoutineLabel}
                                onChange={e => setNewRoutineLabel(e.target.value)}
                                placeholder="Descreva a atividade a ser checada..."
                                className="flex-1 min-w-[200px] bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                            />
                            <select
                                value={newRoutinePlatform}
                                onChange={e => setNewRoutinePlatform(e.target.value as 'meta' | 'google' | 'geral')}
                                className="bg-background border border-card-border rounded-lg px-2 py-2 text-sm text-white focus:outline-none"
                            >
                                <option value="meta">Meta Ads</option>
                                <option value="google">Google Ads</option>
                                <option value="geral">Geral</option>
                            </select>
                            <button 
                                onClick={() => {
                                    if(newRoutineLabel.trim()){
                                        setRoutines([...routines, { label: newRoutineLabel.trim(), platform: newRoutinePlatform }]);
                                        setNewRoutineLabel("");
                                    }
                                }} 
                                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-semibold text-sm transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['meta', 'google', 'geral'].map(platform => {
                                const pts = routines.filter(r => r.platform === platform);
                                return (
                                    <div key={platform} className="bg-card/30 border border-card-border rounded-lg p-4">
                                        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4 pb-2 border-b border-white/5">
                                            {platform === 'meta' ? '📘 Meta' : platform === 'google' ? '🔍 Google' : '⚙️ Geral'}
                                        </h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {pts.length === 0 && <p className="text-[11px] text-muted-foreground">Nenhuma rotina para esta rede.</p>}
                                            {pts.map((r, i) => (
                                                <div key={i} className="flex justify-between items-start gap-2 text-sm bg-background border border-card-border p-2 rounded">
                                                    <span className="text-white flex-1">{r.label}</span>
                                                    <button 
                                                        onClick={() => setRoutines(routines.filter(x => x !== r))}
                                                        className="text-muted-foreground hover:text-status-red p-1 shrink-0"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(89,115,255,0.2)] disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                {isSaving ? "Salvando..." : "Salvar Rotinas"}
                            </button>
                        </div>
                    </section>

                    {/* Assinatura e Limites */}
                    <section className="bg-black/20 border border-card-border rounded-xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-status-green/10 flex items-center justify-center border border-status-green/20">
                                <CreditCard className="text-status-green" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Plano e Limites</h2>
                                <p className="text-sm text-muted-foreground">Gerencie sua assinatura do ScaleOS.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card/40 border border-card-border rounded-lg p-5">
                                <div className="text-sm text-muted-foreground mb-1">Plano Atual</div>
                                <div className="text-xl font-bold text-white capitalize flex items-center gap-2">
                                    {agencyData?.plan === 'solo' ? 'Gestor Solo' : agencyData?.plan === 'agency' ? 'Agência Pro' : 'Enterprise'}
                                    <ShieldCheck size={16} className="text-brand-500"/>
                                </div>
                                <button className="mt-4 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">Fazer Upgrade</button>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-card/40 border border-card-border rounded-lg p-5 flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Clientes Ativos (Workspaces)</div>
                                        <div className="text-2xl font-bold text-white">
                                            {clientsCount} <span className="text-base font-normal text-muted-foreground">/ {maxSeats}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-1 rounded">
                                        {100 - usagePercentage < 10 ? 'Quase no limite!' : 'Espaço disponível'}
                                    </div>
                                </div>
                                
                                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden mt-2">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-status-red' : usagePercentage > 75 ? 'bg-status-yellow' : 'bg-status-green'}`}
                                        style={{ width: `${usagePercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

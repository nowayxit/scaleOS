"use client";

import { useState, useEffect } from "react";
import { X, Save, Building2, Link2, DollarSign, Target, Activity } from "lucide-react";
import { Client } from "@/data/mockClients";
import { useAppStore } from "@/store/useAppStore";

interface ClientSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export function ClientSettingsModal({ isOpen, onClose, client }: ClientSettingsModalProps) {
  const updateClient = useAppStore(s => s.updateClient);
  
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        name: client.name,
        niche: client.niche,
        budget: client.budget,
        targetCpa: client.targetCpa,
        currency: client.currency,
        healthStatus: client.healthStatus,
        adsManagerUrl: client.adsManagerUrl || "",
        ga4Url: client.ga4Url || "",
        lookerUrl: client.lookerUrl || "",
        driveFolderUrl: client.driveFolderUrl || "",
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay or await real one if we wrapped useAppStore in promises
    await updateClient(client.id, formData);
    
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-500" size={20} />
            Configurações do Cliente
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="client-settings-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Infos Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Nome do Cliente</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Nicho / Setor</label>
                      <input 
                        type="text" 
                        required
                        value={formData.niche || ''}
                        onChange={e => setFormData({...formData, niche: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
              </div>
            </div>

            {/* Metas e Financeiro */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider">Metas e Financeiro</h3>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <DollarSign size={14} /> Moeda
                      </label>
                      <select 
                        value={formData.currency || 'BRL'}
                        onChange={e => setFormData({...formData, currency: e.target.value as 'BRL' | 'USD' | 'EUR'})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none"
                      >
                          <option value="BRL">BRL (R$)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <DollarSign size={14} /> Budget Mensal
                      </label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        step="0.01"
                        value={formData.budget || 0}
                        onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Target size={14} /> CPA Meta
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.targetCpa || 0}
                        onChange={e => setFormData({...formData, targetCpa: Number(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Activity size={14} /> Saúde da Conta
                  </label>
                  <select 
                    value={formData.healthStatus || 'good'}
                    onChange={e => setFormData({...formData, healthStatus: e.target.value as 'good' | 'warning' | 'critical'})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none"
                  >
                      <option value="good">🟢 Bom (CPA Saudável)</option>
                      <option value="warning">🟡 Atenção (CPA Subindo)</option>
                      <option value="critical">🔴 Crítico (CPA Alto / Falta verba)</option>
                  </select>
              </div>
            </div>

            {/* Links Úteis */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-2">
                  <Link2 size={16} /> Links Úteis
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Gerenciador de Anúncios</label>
                      <input 
                        type="url" 
                        placeholder="https://adsmanager.facebook.com/..."
                        value={formData.adsManagerUrl || ''}
                        onChange={e => setFormData({...formData, adsManagerUrl: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
                  <div>
                      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Google Analytics (GA4)</label>
                      <input 
                        type="url" 
                        placeholder="https://analytics.google.com/..."
                        value={formData.ga4Url || ''}
                        onChange={e => setFormData({...formData, ga4Url: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
                  <div>
                      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Looker Studio (Dashboard)</label>
                      <input 
                        type="url" 
                        placeholder="https://lookerstudio.google.com/..."
                        value={formData.lookerUrl || ''}
                        onChange={e => setFormData({...formData, lookerUrl: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
                  <div>
                      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Pasta do Drive (Criativos)</label>
                      <input 
                        type="url" 
                        placeholder="https://drive.google.com/..."
                        value={formData.driveFolderUrl || ''}
                        onChange={e => setFormData({...formData, driveFolderUrl: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                  </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="client-settings-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
                <> <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Salvando... </>
            ) : (
                <> <Save size={16} /> Salvar Alterações </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { useTaskStore } from "@/store/useTaskStore";
import Link from "next/link";
import {
    ArrowLeft, ExternalLink, Activity, Target, Zap, Clock, Save,
    RefreshCcw, Plus, Trash2, Edit2, X, CheckCircle2, Folder, Presentation, Download
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { ClientSettingsModal } from "@/components/ClientSettingsModal";

export default function CockpitPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const client = useAppStore(s => s.clients.find(c => c.id === id));
    const allRoutines = useAppStore(s => s.routines);
    const allDecisionLogs = useAppStore(s => s.decisionLogs);
    const allMeetingNotes = useAppStore(s => s.meetingNotes);
    const routines = useMemo(() => allRoutines.filter(r => r.clientId === id), [allRoutines, id]);
    const decisionLogs = useMemo(() => allDecisionLogs.filter(d => d.clientId === id), [allDecisionLogs, id]);
    const meetingNotes = useMemo(() => allMeetingNotes.filter(n => n.clientId === id), [allMeetingNotes, id]);
    const saveOptimizationSession = useAppStore(s => s.saveOptimizationSession);
    const updateClient = useAppStore(s => s.updateClient);
    const toggleRoutineItem = useAppStore(s => s.toggleRoutineItem);
    const addRoutineItem = useAppStore(s => s.addRoutineItem);
    const deleteRoutineItem = useAppStore(s => s.deleteRoutineItem);
    const addDecisionLog = useAppStore(s => s.addDecisionLog);
    const updateDecisionLog = useAppStore(s => s.updateDecisionLog);
    const addMeetingNote = useAppStore(s => s.addMeetingNote);
    const updateMeetingNote = useAppStore(s => s.updateMeetingNote);
    const deleteMeetingNote = useAppStore(s => s.deleteMeetingNote);
    
    // Tasks integration
    const allTasks = useTaskStore(s => s.tasks);
    const columns = useTaskStore(s => s.columns);
    const clientTasks = useMemo(() => allTasks.filter(t => t.clientId === id), [allTasks, id]);

    const [insight, setInsight] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [newRoutineLabel, setNewRoutineLabel] = useState("");
    const [newRoutinePlatform, setNewRoutinePlatform] = useState<'meta' | 'google' | 'geral'>('meta');
    const [showRoutineInput, setShowRoutineInput] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [logForm, setLogForm] = useState({ id: '', title: '', hypothesis: '', result: '', type: 'strategy' as 'strategy' | 'creative' | 'budget' | 'pause' });

    // Meeting notes forms
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [meetingForm, setMeetingForm] = useState({ id: '', subject: '', content: '' });

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    if (!client) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-white">
                <div className="text-center w-full max-w-md p-8 glass-panel rounded-xl">
                    <h1 className="text-6xl font-black text-brand-500 mb-4">404</h1>
                    <p className="text-muted-foreground mb-8 text-lg">Cliente não encontrado.</p>
                    <Link href="/" className="px-6 py-3 bg-brand-600 rounded-md hover:bg-brand-500 transition-colors font-medium">
                        Voltar para The Tower
                    </Link>
                </div>
            </div>
        );
    }

    const handleSaveSession = async () => {
        if (!insight.trim()) return;
        setIsSaving(true);
        try {
            saveOptimizationSession(client.id, insight);
            setInsight("");
            router.push('/');
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar o ciclo. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddRoutine = () => {
        if (!newRoutineLabel.trim()) return;
        addRoutineItem(client.id, newRoutineLabel, newRoutinePlatform);
        setNewRoutineLabel("");
        setShowRoutineInput(false);
    };

    const handleAddLog = () => {
        if (!logForm.title.trim()) return;
        
        if (logForm.id) {
            updateDecisionLog(logForm.id, {
                title: logForm.title,
                hypothesis: logForm.hypothesis,
            });
        } else {
            addDecisionLog({
                clientId: client.id,
                date: new Date().toISOString(),
                title: logForm.title,
                hypothesis: logForm.hypothesis,
                result: '',
                type: 'strategy',
            });
        }
        setLogForm({ id: '', title: '', hypothesis: '', result: '', type: 'strategy' });
        setShowLogForm(false);
    };

    const handleEditLog = (log: any) => {
        setLogForm({
            id: log.id,
            title: log.title,
            hypothesis: log.hypothesis || '',
            result: log.result || '',
            type: log.type || 'strategy'
        });
        setShowLogForm(true);
    };

    // Meeting Notes Handlers
    const handleSaveMeetingNote = () => {
        if (!meetingForm.subject.trim()) return;
        
        if (meetingForm.id) {
            updateMeetingNote(meetingForm.id, {
                subject: meetingForm.subject,
                content: meetingForm.content
            });
        } else {
            addMeetingNote({
                clientId: client.id,
                date: new Date().toISOString(),
                subject: meetingForm.subject,
                content: meetingForm.content
            });
        }
        setMeetingForm({ id: '', subject: '', content: '' });
        setShowMeetingForm(false);
    };

    const handleEditMeetingNote = (note: any) => {
        setMeetingForm({
            id: note.id,
            subject: note.subject,
            content: note.content
        });
        setShowMeetingForm(true);
    };

    const completedCount = routines.filter(r => r.done).length;
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: client.currency }).format(val);
    const pacingPercentage = Math.min((client.currentSpend / client.budget) * 100, 100);
    const platformColors: Record<string, string> = {
        meta: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
        google: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
        geral: 'text-brand-400 bg-brand-400/10 border-brand-500/20',
    };

    return (
        <>
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen bg-background">

                {/* Header */}
                <header className="border-b border-card-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
                    <div className="px-8 py-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                                    <ArrowLeft size={16} /> Voltar
                                </Link>
                                <span>/</span>
                                <span>Cockpit</span>
                                <span>/</span>
                                <span className="text-brand-300 font-medium">{client.name}</span>
                            </div>
                            <div className="flex gap-2">
                                {client.adsManagerUrl && (
                                    <a href={client.adsManagerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors">
                                        <ExternalLink size={12} /> Ads Manager
                                    </a>
                                )}
                                {client.ga4Url && (
                                    <a href={client.ga4Url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors">
                                        <ExternalLink size={12} /> GA4
                                    </a>
                                )}
                                {client.lookerUrl && (
                                    <a href={client.lookerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors">
                                        <ExternalLink size={12} /> Looker
                                    </a>
                                )}
                                {client.driveFolderUrl && (
                                    <a href={client.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-300 hover:text-white hover:bg-brand-500/20 transition-colors">
                                        <Folder size={12} /> Pasta / Arquivos
                                    </a>
                                )}
                                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors print:hidden">
                                    <Edit2 size={12} /> Editar Cliente
                                </button>
                                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 rounded-lg text-white transition-colors print:hidden shadow-[0_0_15px_rgba(89,115,255,0.2)]">
                                    <Download size={12} /> Exportar Relatório
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {client.name}
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-card-border text-muted-foreground font-mono font-normal">{client.niche}</span>
                                </h1>
                                <div className="flex gap-8 mt-3">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Budget Mensal</p>
                                        <div className="flex items-end gap-2 text-white">
                                            <span className="text-xl font-mono">{formatCurrency(client.budget)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">CPA Meta</p>
                                        <div className="flex items-center gap-1.5 text-white">
                                            <Target size={16} className="text-brand-400" />
                                            <span className="text-lg font-mono">{formatCurrency(client.targetCpa)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Saúde</p>
                                        <div className={`flex items-center gap-1.5 ${client.healthStatus === 'critical' ? 'text-status-red' : client.healthStatus === 'warning' ? 'text-status-yellow' : 'text-status-green'}`}>
                                            <Activity size={16} />
                                            <span className="text-sm font-medium">{client.healthStatus === 'critical' ? '🔴 Crítico' : client.healthStatus === 'warning' ? '🟡 Atenção' : '🟢 OK'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveSession}
                                disabled={!insight.trim() || isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(89,115,255,0.2)]"
                            >
                                {isSaving ? <RefreshCcw size={15} className="animate-spin" /> : <Save size={15} />}
                                {isSaving ? 'Salvando...' : 'Salvar Ciclo'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 overflow-y-auto">

                    {/* Próximo Passo / Insight Ativo */}
                    {client.pendingInsight && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-brand-600/10 border border-brand-500/30 shadow-[0_0_20px_rgba(89,115,255,0.05)]">
                            <Zap size={18} className="text-brand-400 mt-0.5 shrink-0 animate-pulse" />
                            <div>
                                <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-widest mb-1">⚡ Próximo Passo / Insight Ativo</p>
                                <p className="text-sm text-brand-100 font-medium leading-relaxed">{client.pendingInsight}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-6">

                        {/* Left: Routine Engine */}
                        <div className="col-span-12 lg:col-span-7 space-y-4">
                            <section className="glass-panel p-6 rounded-xl border border-card-border/60">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                                            <Zap className="text-brand-400" size={18} /> Rotina de Otimização
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{completedCount}/{routines.length} itens concluídos</p>
                                    </div>
                                    <button
                                        onClick={() => setShowRoutineInput(!showRoutineInput)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors print:hidden"
                                    >
                                        <Plus size={12} /> Adicionar
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="mb-5">
                                    <div className="h-1 bg-card-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 transition-all duration-500"
                                            style={{ width: routines.length ? `${(completedCount / routines.length) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>

                                {/* Add routine input */}
                                {showRoutineInput && (
                                    <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-brand-500/20 flex gap-2">
                                        <input
                                            value={newRoutineLabel}
                                            onChange={e => setNewRoutineLabel(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddRoutine()}
                                            placeholder="Descrição da atividade de rotina..."
                                            className="flex-1 bg-background border border-card-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                                        />
                                        <select
                                            value={newRoutinePlatform}
                                            onChange={e => setNewRoutinePlatform(e.target.value as 'meta' | 'google' | 'geral')}
                                            className="bg-background border border-card-border rounded px-2 py-2 text-sm text-white focus:outline-none"
                                        >
                                            <option value="meta">Meta</option>
                                            <option value="google">Google</option>
                                            <option value="geral">Geral</option>
                                        </select>
                                        <button onClick={handleAddRoutine} className="px-3 py-2 bg-brand-600 rounded text-white text-sm hover:bg-brand-500 transition-colors">OK</button>
                                        <button onClick={() => setShowRoutineInput(false)} className="p-2 text-muted-foreground hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Routine items */}
                                <div className="space-y-1">
                                    {routines.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma rotina cadastrada. Adicione acima.</p>
                                    )}
                                    {['meta', 'google', 'geral'].map(platform => {
                                        const items = routines.filter(r => r.platform === platform);
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={platform} className="mb-4">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                                                    {platform === 'meta' ? '📘 Meta Ads' : platform === 'google' ? '🔍 Google Ads' : '⚙️ Geral'}
                                                </p>
                                                {items.map(r => (
                                                    <label key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-card-border transition-colors cursor-pointer group mb-1">
                                                        <div className="relative shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={r.done}
                                                                onChange={() => toggleRoutineItem(r.id)}
                                                                className="peer appearance-none w-4 h-4 border border-muted-foreground/50 rounded bg-transparent checked:bg-brand-500 checked:border-brand-500 transition-all cursor-pointer"
                                                            />
                                                            {r.done && <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white pointer-events-none" />}
                                                        </div>
                                                        <span className={`text-sm flex-1 transition-colors ${r.done ? 'line-through text-muted-foreground/50' : 'text-muted-foreground group-hover:text-foreground'}`}>{r.label}</span>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); deleteRoutineItem(r.id); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-status-red transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </label>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Meeting Notes Integration */}
                                <div className="mt-8 pt-6 border-t border-card-border/60">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-2">
                                            <Presentation size={16} /> Anotações de Reuniões
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setMeetingForm({ id: '', subject: '', content: '' });
                                                setShowMeetingForm(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors print:hidden"
                                        >
                                            <Plus size={12} /> Nova Ata
                                        </button>
                                    </div>

                                    {showMeetingForm && (
                                        <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-brand-500/20 space-y-3">
                                            <input
                                                value={meetingForm.subject}
                                                onChange={e => setMeetingForm({ ...meetingForm, subject: e.target.value })}
                                                placeholder="Assunto da Reunião (Ex: Alinhamento Mensal)"
                                                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                                            />
                                            <textarea
                                                value={meetingForm.content}
                                                onChange={e => setMeetingForm({ ...meetingForm, content: e.target.value })}
                                                placeholder="Tópicos discutidos, próximos passos confirmados..."
                                                rows={5}
                                                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40 resize-none"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setShowMeetingForm(false)} className="px-3 py-1.5 text-xs text-muted-foreground border border-card-border rounded-lg hover:text-white transition-colors">Cancelar</button>
                                                <button onClick={handleSaveMeetingNote} className="px-4 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-colors">Salvar Anotação</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {meetingNotes.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4 bg-white/[0.02] rounded-xl border border-card-border border-dashed">Nenhuma ata de reunião registrada.</p>
                                        ) : (
                                            meetingNotes.map(note => (
                                                <div key={note.id} className="bg-white/[0.03] border border-card-border rounded-lg p-4 group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-sm text-white font-semibold">{note.subject}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <time className="text-[10px] text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border border-card-border">
                                                                {new Date(note.date).toLocaleDateString('pt-BR')}
                                                            </time>
                                                            <button onClick={() => handleEditMeetingNote(note)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-white transition-opacity">
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <button onClick={() => deleteMeetingNote(note.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-status-red transition-opacity">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Task Integration */}
                                <div className="mt-8 pt-6 border-t border-card-border/60">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider">Tarefas Ativas ({clientTasks.length})</h3>
                                        <Link href="/tarefas" className="text-xs text-brand-400 hover:text-brand-300">Ir para Gestão de Tarefas</Link>
                                    </div>
                                    <div className="space-y-2">
                                        {clientTasks.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4 bg-white/[0.02] rounded-xl border border-card-border border-dashed">Nenhuma tarefa associada a este cliente.</p>
                                        ) : (
                                            clientTasks.map(task => {
                                                const column = columns.find(c => c.id === task.columnId);
                                                return (
                                                    <div key={task.id} className="bg-white/[0.03] border border-card-border rounded-lg p-3 flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm text-white font-medium">{task.title}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${task.priority === 'high' ? 'bg-status-red/20 text-status-red' : task.priority === 'medium' ? 'bg-status-yellow/20 text-status-yellow' : 'bg-brand-500/20 text-brand-300'}`}>
                                                                    {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                                                </span>
                                                                {task.dueDate && <span>{task.dueDate}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground bg-background border border-card-border px-2 py-1 rounded">
                                                            {column?.title || 'Sem coluna'}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right: Decision Log */}
                        <div className="col-span-12 lg:col-span-5 space-y-4">
                            <section className="glass-panel p-6 rounded-xl border border-card-border/60">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-base font-semibold text-white">🧠 Log de Insights</h2>
                                    <button
                                        onClick={() => {
                                            setLogForm({ id: '', title: '', hypothesis: '', result: '', type: 'strategy' });
                                            setShowLogForm(true);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] border border-card-border rounded-lg text-muted-foreground hover:text-white transition-colors print:hidden"
                                    >
                                        <Plus size={12} /> Registrar
                                    </button>
                                </div>

                                {/* Add log form */}
                                {showLogForm && (
                                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-brand-500/20 space-y-3">
                                        <input
                                            value={logForm.title}
                                            onChange={e => setLogForm({ ...logForm, title: e.target.value })}
                                            placeholder="Título da decisão (Ex: Pausa criativo #03)"
                                            className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40"
                                        />
                                            <textarea
                                                value={logForm.hypothesis}
                                                onChange={e => setLogForm({ ...logForm, hypothesis: e.target.value })}
                                                placeholder="Insights e raciocínio para os próximos passos..."
                                                rows={4}
                                                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-muted-foreground/40 resize-none"
                                            />
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setShowLogForm(false)} className="px-3 py-1.5 text-xs text-muted-foreground border border-card-border rounded-lg hover:text-white transition-colors">Cancelar</button>
                                            <button onClick={handleAddLog} className="px-4 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-colors">Salvar Log</button>
                                        </div>
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className="space-y-4 relative">
                                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500/40 via-card-border to-transparent"></div>

                                    {decisionLogs.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-6 ml-6">Nenhuma decisão registrada ainda.</p>
                                    )}

                                    {decisionLogs.map((log, i) => (
                                        <div key={log.id} className="relative pl-8 group">
                                            <div className={`absolute left-0 w-5 h-5 rounded-full border-2 flex items-center justify-center -translate-y-0.5 ${i === 0 ? 'border-brand-400 bg-card' : 'border-card-border bg-background'}`}>
                                                {i === 0 && <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />}
                                            </div>
                                            <div className="bg-white/[0.02] border border-card-border rounded-xl p-4 hover:border-brand-500/20 transition-colors">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <span className="font-semibold text-sm text-white leading-tight pr-4">{log.title}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button 
                                                            onClick={() => handleEditLog(log)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-white transition-opacity"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <time className="text-[10px] text-muted-foreground font-mono">
                                                            {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </time>
                                                    </div>
                                                </div>
                                                {log.hypothesis && (
                                                    <p className="text-xs text-muted-foreground border-l-2 border-brand-500/30 pl-2 mb-1.5 whitespace-pre-wrap leading-relaxed">
                                                        {log.hypothesis}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <ClientSettingsModal 
                isOpen={showSettingsModal} 
                onClose={() => setShowSettingsModal(false)}
                client={client}
            />
        </>
    );
}

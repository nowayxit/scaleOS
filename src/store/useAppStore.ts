import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, mockClients as initialMockClients } from '@/data/mockClients';

export interface DecisionLog {
    id: string;
    clientId: string;
    date: string;
    title: string;
    hypothesis: string;
    result: string;
    type: 'strategy' | 'creative' | 'budget' | 'pause';
}

export interface Creative {
    id: string;
    clientId: string;
    name: string;
    type: 'video' | 'static' | 'ugc' | 'carousel';
    hookRate: number;
    holdRate: number;
    ctr: number;
    roas: number;
    cpm: number;
    status: 'active' | 'paused' | 'fatigued';
    createdAt: string;
}

export interface ClientCase {
    id: string;
    clientId: string | null;
    clientName: string;
    strategy: string;
    investment: number;
    revenue: number;
    roi: number;
    notes: string;
    createdAt: string;
}

export interface MeetingNote {
    id: string;
    clientId: string;
    date: string;
    subject: string;
    content: string;
}

export interface Routine {
    id: string;
    clientId: string;
    label: string;
    done: boolean;
    platform: 'meta' | 'google' | 'geral';
}

export interface ZenMode {
    active: boolean;
    clientId: string | null;
    startedAt: string | null;
}

export interface Agency {
    id: string;
    name: string;
    plan: 'solo' | 'agency' | 'enterprise';
    maxSeats: number;
    logoUrl?: string;
}

interface AppState {
    agency: Agency;
    clients: Client[];
    decisionLogs: DecisionLog[];
    creatives: Creative[];
    routines: Routine[];
    zenMode: ZenMode;
    cases: ClientCase[];
    meetingNotes: MeetingNote[];
    globalTaskFilter: string;

    // Agency
    updateAgency: (updates: Partial<Agency>) => void;

    // Bulk Setters for Onboarding/Login Hydration
    setClients: (clients: Client[]) => void;
    setRoutines: (routines: Routine[]) => void;
    setDecisionLogs: (logs: DecisionLog[]) => void;
    setCases: (cases: ClientCase[]) => void;

    // Cases CRUD
    addCase: (clientCase: Omit<ClientCase, 'id' | 'createdAt'>) => void;
    updateCase: (id: string, updates: Partial<ClientCase>) => void;
    deleteCase: (id: string) => void;

    // Meeting Notes CRUD
    addMeetingNote: (note: Omit<MeetingNote, 'id'>) => void;
    updateMeetingNote: (id: string, updates: Partial<MeetingNote>) => void;
    deleteMeetingNote: (id: string) => void;

    // Client CRUD
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;

    // Routine Engine
    saveOptimizationSession: (clientId: string, insight: string) => void;
    toggleRoutineItem: (routineId: string) => void;
    addRoutineItem: (clientId: string, label: string, platform: 'meta' | 'google' | 'geral') => void;
    deleteRoutineItem: (routineId: string) => void;
    resetRoutinesForClient: (clientId: string) => void;

    // Decision Log
    addDecisionLog: (log: Omit<DecisionLog, 'id'>) => void;
    updateDecisionLog: (id: string, updates: Partial<DecisionLog>) => void;

    // Creatives
    addCreative: (creative: Omit<Creative, 'id'>) => void;
    updateCreative: (id: string, updates: Partial<Creative>) => void;
    deleteCreative: (id: string) => void;

    // Zen Mode
    toggleZenMode: (clientId?: string) => void;
    setGlobalTaskFilter: (clientId: string) => void;
}

const DEFAULT_ROUTINES: Omit<Routine, 'id' | 'clientId'>[] = [
    { label: 'Verificar Frequência Analítica (> 4)', done: false, platform: 'meta' },
    { label: 'Analisar Hook Rate dos Top 3 Vídeos (> 18%)', done: false, platform: 'meta' },
    { label: 'Checar CPL histórico vs. CPL atual', done: false, platform: 'meta' },
    { label: 'Verificar Lead Form / LP (taxa de conversão)', done: false, platform: 'meta' },
    { label: 'Negativação de palavras-chave irrelevantes', done: false, platform: 'google' },
    { label: 'Checar Parcela de Impressão (IS)', done: false, platform: 'google' },
    { label: 'Revisar extensões de anúncio ativas', done: false, platform: 'google' },
    { label: 'Confirmar que o pixel está disparando corretamente', done: false, platform: 'geral' },
];

const DEFAULT_DECISION_LOGS: DecisionLog[] = [
    {
        id: 'dl-1',
        clientId: 'c1',
        date: '2026-02-12T14:30:00Z',
        title: 'Troca de Landing Page',
        hypothesis: 'LP longa estava perdendo tráfego mobile. Bounce rate >80% no mobile.',
        result: 'CPL caiu 30% em 7 dias. Alteração validada e mantida.',
        type: 'strategy',
    },
    {
        id: 'dl-2',
        clientId: 'c1',
        date: '2026-02-05T09:12:00Z',
        title: 'Pausa Ad #04 (Static)',
        hypothesis: 'Fadiga detectada. Frequência bateu 6.1 e CTR dropou de 2% para 0.8%.',
        result: 'Ainda analisando impacto na distribuição do budget restante.',
        type: 'creative',
    },
];

const DEFAULT_CREATIVES: Creative[] = [
    { id: 'cr-1', clientId: 'c1', name: 'UGC - Depoimento Cliente', type: 'ugc', hookRate: 24, holdRate: 12, ctr: 2.8, roas: 4.2, cpm: 18, status: 'active', createdAt: '2026-02-01' },
    { id: 'cr-2', clientId: 'c1', name: 'Estático - Oferta Direta', type: 'static', hookRate: 16, holdRate: 8, ctr: 2.1, roas: 3.8, cpm: 15, status: 'active', createdAt: '2026-02-10' },
    { id: 'cr-3', clientId: 'c1', name: 'Video - Problema/Solução', type: 'video', hookRate: 11, holdRate: 5, ctr: 0.9, roas: 1.2, cpm: 22, status: 'fatigued', createdAt: '2026-01-20' },
    { id: 'cr-4', clientId: 'c2', name: 'Carousel - Benefícios', type: 'carousel', hookRate: 19, holdRate: 10, ctr: 1.5, roas: 2.9, cpm: 14, status: 'active', createdAt: '2026-02-05' },
];

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            agency: {
                id: 'agency-1',
                name: 'Minha Agência',
                plan: 'agency',
                maxSeats: 10,
            },
            clients: [],
            decisionLogs: [],
            creatives: [],
            cases: [],
            meetingNotes: [],
            routines: [],
            zenMode: { active: false, clientId: null, startedAt: null },
            globalTaskFilter: 'all',

            setGlobalTaskFilter: (clientId) => set({ globalTaskFilter: clientId }),

            updateAgency: (updates) =>
                set((state) => ({
                    agency: { ...state.agency, ...updates },
                })),

            setClients: (clients) => set({ clients }),
            setRoutines: (routines) => set({ routines }),
            setDecisionLogs: (decisionLogs) => set({ decisionLogs }),
            setCases: (cases) => set({ cases }),

            addClient: async (client) => {
                const tempId = `temp-${Date.now()}`;
                const newRoutines = DEFAULT_ROUTINES.map((r, i) => ({
                    ...r,
                    id: `routine-${tempId}-${i}`,
                    clientId: tempId,
                }));
                
                // Optimistic UI updates
                set((state) => ({
                    clients: [...state.clients, { ...client, id: tempId }],
                    routines: [...state.routines, ...newRoutines],
                }));

                try {
                    const res = await fetch('/api/clients', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(client)
                    });

                    if (res.ok) {
                        const savedClient = await res.json();
                        set((state) => ({
                            clients: state.clients.map(c => c.id === tempId ? { ...c, ...savedClient, routines: [], decisionLogs: [], cases: [], tasks: [] } : c),
                            routines: state.routines.map(r => r.clientId === tempId ? { ...r, clientId: savedClient.id } : r)
                        }));
                    } else {
                        // Revert on failure
                        const errText = await res.text();
                        console.error("API POST /api/clients failed:", res.status, errText);
                        set((state) => ({ 
                            clients: state.clients.filter((c) => c.id !== tempId),
                            routines: state.routines.filter((r) => r.clientId !== tempId)
                        }));
                    }
                } catch (error) {
                    console.error("Failed to add client - Network or syntax error:", error);
                    set((state) => ({ 
                        clients: state.clients.filter((c) => c.id !== tempId),
                        routines: state.routines.filter((r) => r.clientId !== tempId)
                    }));
                }
            },

            updateClient: (id, updates) => {
                set((state) => ({
                    clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                }));

                fetch(`/api/clients/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                }).catch(err => console.error("Failed to update client", err));
            },

            deleteClient: (id) => {
                set((state) => ({
                    clients: state.clients.filter((c) => c.id !== id),
                    routines: state.routines.filter((r) => r.clientId !== id),
                    decisionLogs: state.decisionLogs.filter((d) => d.clientId !== id),
                    creatives: state.creatives.filter((cr) => cr.clientId !== id),
                    cases: state.cases.filter((c) => c.clientId !== id),
                }));

                fetch(`/api/clients/${id}`, { method: 'DELETE' }).catch(err => console.error("Failed to delete client", err));
            },

            saveOptimizationSession: (clientId, insight) =>
                set((state) => ({
                    clients: state.clients.map((c) =>
                        c.id === clientId
                            ? {
                                ...c,
                                lastOptimization: 'Agora mesmo',
                                pendingInsight: insight,
                                nextReviewDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
                            }
                            : c
                    ),
                    // Reset routines for next cycle
                    routines: state.routines.map((r) =>
                        r.clientId === clientId ? { ...r, done: false } : r
                    ),
                })),

            toggleRoutineItem: (routineId) => {
                let updatedDoneState = false;
                set((state) => ({
                    routines: state.routines.map((r) => {
                        if (r.id === routineId) {
                            updatedDoneState = !r.done;
                            return { ...r, done: updatedDoneState };
                        }
                        return r;
                    }),
                }));

                fetch(`/api/routines/${routineId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ done: updatedDoneState })
                }).catch(err => console.error("Failed to toggle routine", err));
            },

            addRoutineItem: async (clientId, label, platform) => {
                const tempId = `temp-routine-${Date.now()}`;
                
                set((state) => ({
                    routines: [
                        ...state.routines,
                        { id: tempId, clientId, label, done: false, platform },
                    ],
                }));

                try {
                    const res = await fetch('/api/routines', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ label, platform, clientId })
                    });
                    if (res.ok) {
                        const savedRoutine = await res.json();
                        set((state) => ({
                            routines: state.routines.map(r => r.id === tempId ? { ...savedRoutine } : r)
                        }));
                    } else {
                        set((state) => ({ routines: state.routines.filter(r => r.id !== tempId) }));
                    }
                } catch (error) {
                    console.error("Failed to add routine", error);
                    set((state) => ({ routines: state.routines.filter(r => r.id !== tempId) }));
                }
            },

            deleteRoutineItem: (routineId) => {
                set((state) => ({
                    routines: state.routines.filter((r) => r.id !== routineId),
                }));

                fetch(`/api/routines/${routineId}`, { method: 'DELETE' }).catch(err => console.error("Failed to delete routine", err));
            },

            resetRoutinesForClient: (clientId) =>
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.clientId === clientId ? { ...r, done: false } : r
                    ),
                })),

            addDecisionLog: async (log) => {
                const tempId = `temp-dl-${Date.now()}`;
                
                // Optimistic UI
                set((state) => ({
                    decisionLogs: [{ ...log, id: tempId }, ...state.decisionLogs],
                }));

                try {
                    const res = await fetch('/api/decision-logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(log)
                    });
                    if (res.ok) {
                        const savedLog = await res.json();
                        set((state) => ({
                            decisionLogs: state.decisionLogs.map(l => l.id === tempId ? { ...savedLog } : l)
                        }));
                    } else {
                        set((state) => ({ decisionLogs: state.decisionLogs.filter(l => l.id !== tempId) }));
                    }
                } catch (error) {
                    console.error("Failed to add decision log", error);
                    set((state) => ({ decisionLogs: state.decisionLogs.filter(l => l.id !== tempId) }));
                }
            },

            updateDecisionLog: (id, updates) => {
                set((state) => ({
                    decisionLogs: state.decisionLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
                }));

                fetch(`/api/decision-logs/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                }).catch(err => console.error("Failed to update log", err));
            },

            addCreative: (creative) =>
                set((state) => ({
                    creatives: [...state.creatives, { ...creative, id: `cr-${Date.now()}` }],
                })),

            updateCreative: (id, updates) =>
                set((state) => ({
                    creatives: state.creatives.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                })),

            deleteCreative: (id) =>
                set((state) => ({
                    creatives: state.creatives.filter((c) => c.id !== id),
                })),

            addCase: async (clientCase) => {
                const tempId = `temp-case-${Date.now()}`;
                const tempCreatedAt = new Date().toISOString();

                // Optimistic UI
                set((state) => ({
                    cases: [{ ...clientCase, id: tempId, createdAt: tempCreatedAt }, ...state.cases],
                }));

                try {
                    const res = await fetch('/api/cases', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clientCase)
                    });
                    if (res.ok) {
                        const savedCase = await res.json();
                        set((state) => ({
                            cases: state.cases.map(c => c.id === tempId ? { ...savedCase } : c)
                        }));
                    } else {
                        set((state) => ({ cases: state.cases.filter(c => c.id !== tempId) }));
                    }
                } catch (error) {
                    console.error("Failed to add case", error);
                    set((state) => ({ cases: state.cases.filter(c => c.id !== tempId) }));
                }
            },

            updateCase: (id, updates) => {
                set((state) => ({
                    cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                }));

                fetch(`/api/cases/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                }).catch(err => console.error("Failed to update case", err));
            },

            deleteCase: (id) => {
                set((state) => ({
                    cases: state.cases.filter((c) => c.id !== id),
                }));

                fetch(`/api/cases/${id}`, { method: 'DELETE' }).catch(err => console.error("Failed to delete case", err));
            },

            addMeetingNote: async (note) => {
                const tempId = `temp-note-${Date.now()}`;

                set((state) => ({
                    meetingNotes: [{ ...note, id: tempId }, ...state.meetingNotes],
                }));

                try {
                    const res = await fetch('/api/meeting-notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(note)
                    });
                    if (res.ok) {
                        const savedNote = await res.json();
                        set((state) => ({
                            meetingNotes: state.meetingNotes.map(n => n.id === tempId ? { ...savedNote } : n)
                        }));
                    } else {
                        set((state) => ({ meetingNotes: state.meetingNotes.filter(n => n.id !== tempId) }));
                    }
                } catch (error) {
                    console.error("Failed to add note", error);
                    set((state) => ({ meetingNotes: state.meetingNotes.filter(n => n.id !== tempId) }));
                }
            },

            updateMeetingNote: (id, updates) => {
                set((state) => ({
                    meetingNotes: state.meetingNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
                }));

                fetch(`/api/meeting-notes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                }).catch(err => console.error("Failed to update note", err));
            },

            deleteMeetingNote: (id) => {
                set((state) => ({
                    meetingNotes: state.meetingNotes.filter((n) => n.id !== id),
                }));

                fetch(`/api/meeting-notes/${id}`, { method: 'DELETE' }).catch(err => console.error("Failed to delete note", err));
            },

            toggleZenMode: (clientId) =>
                set((state) => ({
                    zenMode: state.zenMode.active
                        ? { active: false, clientId: null, startedAt: null }
                        : {
                            active: true,
                            clientId: clientId || null,
                            startedAt: new Date().toISOString(),
                        },
                })),
        }),
        {
            name: 'scaleos-storage', // persiste no localStorage do navegador!
        }
    )
);

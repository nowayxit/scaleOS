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

interface AppState {
    clients: Client[];
    decisionLogs: DecisionLog[];
    creatives: Creative[];
    routines: Routine[];
    zenMode: ZenMode;

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

    // Creatives
    addCreative: (creative: Omit<Creative, 'id'>) => void;
    updateCreative: (id: string, updates: Partial<Creative>) => void;
    deleteCreative: (id: string) => void;

    // Zen Mode
    toggleZenMode: (clientId?: string) => void;
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
            clients: initialMockClients,
            decisionLogs: DEFAULT_DECISION_LOGS,
            creatives: DEFAULT_CREATIVES,
            routines: initialMockClients.flatMap(client =>
                DEFAULT_ROUTINES.map((r, i) => ({
                    ...r,
                    id: `routine-${client.id}-${i}`,
                    clientId: client.id,
                }))
            ),
            zenMode: { active: false, clientId: null, startedAt: null },

            addClient: (client) =>
                set((state) => {
                    const newId = `c-${Date.now()}`;
                    const newRoutines = DEFAULT_ROUTINES.map((r, i) => ({
                        ...r,
                        id: `routine-${newId}-${i}`,
                        clientId: newId,
                    }));
                    return {
                        clients: [...state.clients, { ...client, id: newId }],
                        routines: [...state.routines, ...newRoutines],
                    };
                }),

            updateClient: (id, updates) =>
                set((state) => ({
                    clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                })),

            deleteClient: (id) =>
                set((state) => ({
                    clients: state.clients.filter((c) => c.id !== id),
                    routines: state.routines.filter((r) => r.clientId !== id),
                    decisionLogs: state.decisionLogs.filter((d) => d.clientId !== id),
                    creatives: state.creatives.filter((cr) => cr.clientId !== id),
                })),

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

            toggleRoutineItem: (routineId) =>
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId ? { ...r, done: !r.done } : r
                    ),
                })),

            addRoutineItem: (clientId, label, platform) =>
                set((state) => ({
                    routines: [
                        ...state.routines,
                        { id: `routine-custom-${Date.now()}`, clientId, label, done: false, platform },
                    ],
                })),

            deleteRoutineItem: (routineId) =>
                set((state) => ({
                    routines: state.routines.filter((r) => r.id !== routineId),
                })),

            resetRoutinesForClient: (clientId) =>
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.clientId === clientId ? { ...r, done: false } : r
                    ),
                })),

            addDecisionLog: (log) =>
                set((state) => ({
                    decisionLogs: [{ ...log, id: `dl-${Date.now()}` }, ...state.decisionLogs],
                })),

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

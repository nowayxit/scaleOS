import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/components/TaskCard';

export interface Tag {
  id: string;
  name: string;
  color: string; // e.g., 'bg-blue-500 text-white'
}

export interface TaskColumn {
  id: string;
  title: string;
  order: number;
}

export interface TaskStoreState {
  tasks: Task[];
  tags: Tag[];
  columns: TaskColumn[];
  
  // Tasks CRUD
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  
  // Tags CRUD
  addTag: (name: string, color: string) => void;
  deleteTag: (id: string) => void;

  // Columns CRUD
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (columnIds: string[]) => void;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Otimizar Campanhas Meta Ads', clientName: 'AlphaTech', clientId: 'c1', columnId: 'col-3', priority: 'high', dueDate: 'Hoje', comments: [{ id: 'mock-1', text: 'Precisamos focar no ROAS nessa semana.', createdAt: new Date().toISOString(), createdBy: 'Gestor' }], tags: ['tag-1'] },
  { id: '2', title: 'Criar Relatório Mensal', clientName: 'Omega Fit', clientId: 'c2', columnId: 'col-2', priority: 'medium', dueDate: 'Amanhã', tags: ['tag-2'] },
  { id: '3', title: 'Reunião de Alinhamento de Criativos', clientName: 'Zeta Bank', clientId: 'c3', columnId: 'col-1', priority: 'low' },
  { id: '4', title: 'Configurar Pixel TikTok', clientName: 'AlphaTech', clientId: 'c1', columnId: 'col-5', priority: 'high', dueDate: 'Ontem', comments: [], tags: ['tag-1'] },
];

const initialTags: Tag[] = [
  { id: 'tag-1', name: 'Mídia Paga', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'tag-2', name: 'Relatório', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'tag-3', name: 'Estratégia', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
];

const initialColumns: TaskColumn[] = [
  { id: 'col-1', title: 'Backlog', order: 0 },
  { id: 'col-2', title: 'A Fazer', order: 1 },
  { id: 'col-3', title: 'Em Progresso', order: 2 },
  { id: 'col-4', title: 'Em Revisão', order: 3 },
  { id: 'col-5', title: 'Concluído', order: 4 },
];

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      tags: initialTags,
      columns: initialColumns,

      addTask: (task) => set((state) => ({
        tasks: [{ ...task, id: `task-${Date.now()}` }, ...state.tasks]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      moveTask: (taskId, newColumnId) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t)
      })),

      addTag: (name, color) => set((state) => ({
        tags: [...state.tags, { id: `tag-${Date.now()}`, name, color }]
      })),

      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(t => t.id !== id),
        tasks: state.tasks.map(t => ({
          ...t,
          tags: t.tags?.filter(tagId => tagId !== id)
        }))
      })),

      addColumn: (title) => set((state) => ({
          columns: [...state.columns, { id: `col-${Date.now()}`, title, order: state.columns.length }]
      })),

      updateColumn: (id, title) => set((state) => ({
          columns: state.columns.map(c => c.id === id ? { ...c, title } : c)
      })),

      deleteColumn: (id) => set((state) => ({
          columns: state.columns.filter(c => c.id !== id),
          tasks: state.tasks.filter(t => t.columnId !== id) // Remove tasks of deleted column or move them to backlog? Opted to delete for simplicity or user should move them first. (We'll just delete them for now)
      })),

      reorderColumns: (columnIds) => set((state) => ({
          columns: state.columns.map(c => ({
              ...c,
              order: columnIds.indexOf(c.id) !== -1 ? columnIds.indexOf(c.id) : c.order
          })).sort((a,b) => a.order - b.order)
      }))
    }),
    {
      name: 'scaleos-tasks-storage',
    }
  )
);

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
  setTasks: (tasks: Task[]) => void;
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

const initialTasks: Task[] = [];

const initialTags: Tag[] = [];

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

      setTasks: (tasks) => set({ tasks }),

      addTask: async (task) => {
        const tempId = `temp-task-${Date.now()}`;
        // Optimistic
        set((state) => ({
          tasks: [{ ...task, id: tempId }, ...state.tasks]
        }));

        try {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
          });
          if (res.ok) {
            const savedTask = await res.json();
            // We map internal TS representation of tags string[] back if need be, assuming saving returns properly
            const formattedTags = savedTask.tags?.map((t: any) => t.id) || [];
            
            set((state) => ({
              tasks: state.tasks.map(t => t.id === tempId ? { ...savedTask, tags: formattedTags, clientName: task.clientName } : t)
            }));
          } else {
            // Revert
            set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
          }
        } catch (error) {
          console.error("Failed to add task", error);
          set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
        }
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));

        fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }).catch(err => console.error("Failed to update task", err));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));

        fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch(err => console.error("Failed to delete task", err));
      },

      moveTask: (taskId, newColumnId) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t)
        }));

        fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnId: newColumnId })
        }).catch(err => console.error("Failed to move task", err));
      },

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

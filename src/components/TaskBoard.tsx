"use client";

import { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/components/TaskCard';
import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';



export function TaskBoard() {
  const { tasks, columns, moveTask, addColumn, deleteColumn, updateColumn } = useTaskStore();
  const clients = useAppStore(s => s.clients);

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesClient = selectedClient === 'all' || task.clientId === selectedClient;
    return matchesSearch && matchesClient;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, newColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, newColumnId);
    }
  };

  const handleCreateColumn = () => {
    const title = prompt("Nome da nova coluna:");
    if (title && title.trim()) {
      addColumn(title.trim());
    }
  };

  const handleEditColumn = (id: string, currentTitle: string) => {
    const title = prompt("Novo nome da coluna:", currentTitle);
    if (title && title.trim()) {
      updateColumn(id, title.trim());
    }
  };

  const handleDeleteColumn = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta coluna? As tarefas nela também serão excluídas.")) {
      deleteColumn(id);
    }
  };

  const openNewTaskModal = () => {
      setTaskToEdit(null);
      setIsModalOpen(true);
  }

  const openEditTaskModal = (task: Task) => {
      setTaskToEdit(task);
      setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-card-border overflow-hidden backdrop-blur-xl">
      {/* Header & Controls */}
      <div className="p-5 border-b border-card-border bg-card/60 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar tarefas ou clientes..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/60 border border-card-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-muted-foreground/60 shadow-inner"
                />
            </div>
            <div className="relative flex-1 max-w-[240px]">
                 <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" size={14} />
                 <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg pl-9 pr-8 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-400 transition-colors text-brand-100 font-medium cursor-pointer"
                 >
                     <option value="all" className="bg-card text-foreground">Todos os Clientes</option>
                     {clients.map(c => (
                         <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
                     ))}
                 </select>
                 <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                     <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
            </div>

            <div className="flex bg-black/40 border border-card-border rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-brand-500/20 text-brand-300 shadow-sm' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                >
                    <LayoutGrid size={16} /> Kanban
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-brand-500/20 text-brand-300 shadow-sm' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                >
                    <List size={16} /> Lista
                </button>
            </div>
        </div>
        
        <div className="flex gap-2">
            {viewMode === 'kanban' && (
              <button onClick={handleCreateColumn} className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-card-border hover:border-brand-500/50">
                  <Plus size={16} />
                  Coluna
              </button>
            )}
            <button onClick={openNewTaskModal} className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(89,115,255,0.3)] hover:shadow-[0_0_30px_rgba(89,115,255,0.5)] transform hover:-translate-y-0.5">
                <Plus size={18} />
                Nova Tarefa
            </button>
        </div>
      </div>

      {/* Board Layout/List Layout */}
      <div className="flex-1 overflow-x-auto p-6 select-none relative">
        {viewMode === 'kanban' ? (
             <div className="flex gap-6 h-full min-w-max pb-4">
                 {columns.sort((a,b) => a.order - b.order).map(col => {
                     const colTasks = filteredTasks.filter(t => t.columnId === col.id);
                     return (
                         <div 
                            key={col.id} 
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className="w-[340px] flex flex-col h-full bg-black/10 rounded-xl border border-card-border/50 p-2 shrink-0 transition-colors group/col"
                         >
                             <div className={`px-4 py-3 border-b-2 border-brand-500/20 mb-4 flex justify-between items-center bg-card/40 rounded-t-lg group-hover/col:border-brand-500/50 transition-colors`}>
                                 <h3 
                                    className="font-bold text-[13px] uppercase tracking-wider text-white flex items-center gap-2 cursor-pointer hover:text-brand-300 transition-colors"
                                    onClick={() => handleEditColumn(col.id, col.title)}
                                 >
                                     <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(89,115,255,1)]" />
                                     {col.title}
                                 </h3>
                                 <div className="flex items-center gap-2">
                                     <span className="text-xs bg-black/40 border border-card-border px-2 py-0.5 rounded text-muted-foreground font-mono">
                                         {colTasks.length}
                                     </span>
                                     <button onClick={() => handleDeleteColumn(col.id)} className="opacity-0 group-hover/col:opacity-100 p-1 text-muted-foreground hover:text-status-red transition-all cursor-pointer">
                                        <Plus size={14} className="rotate-45" />
                                     </button>
                                 </div>
                             </div>
                             
                             <div className="flex-1 overflow-y-auto px-1 space-y-3 pb-4">
                                 {colTasks.length === 0 ? (
                                     <div className="border-2 border-dashed border-card-border/50 rounded-lg h-24 flex items-center justify-center text-xs text-muted-foreground font-medium bg-black/20">
                                         Solte tarefas aqui
                                     </div>
                                 ) : (
                                     colTasks.map(task => (
                                         <TaskCard key={task.id} task={task} onClick={() => openEditTaskModal(task)} />
                                     ))
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>
        ) : (
             <div className="h-full flex flex-col border border-card-border bg-black/30 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-card-border bg-card/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                     <div className="col-span-5">Título da Tarefa</div>
                     <div className="col-span-2">Cliente</div>
                     <div className="col-span-2">Status</div>
                     <div className="col-span-1">Prioridade</div>
                     <div className="col-span-2">Prazo</div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-1">
                      {filteredTasks.map(task => (
                           <div 
                             key={task.id} 
                             onClick={() => openEditTaskModal(task)}
                             className="grid grid-cols-12 gap-4 p-3 bg-card/30 hover:bg-white/5 rounded-md cursor-pointer border border-transparent hover:border-card-border transition-colors items-center"
                           >
                              <div className="col-span-5 font-medium text-sm text-foreground truncate">{task.title}</div>
                              <div className="col-span-2 text-sm text-muted-foreground">{task.clientName}</div>
                              <div className="col-span-2">
                                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-card-border bg-black/40 text-muted-foreground">
                                      {columns.find(c => c.id === task.columnId)?.title || 'Desconhecido'}
                                  </span>
                              </div>
                              <div className="col-span-1">
                                  <span className="text-xs font-medium">{task.priority === 'high' ? '🔴 Alta' : task.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}</span>
                              </div>
                              <div className="col-span-2 text-sm text-muted-foreground font-mono">{task.dueDate || '-'}</div>
                           </div>
                      ))}
                      {filteredTasks.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                              <p className="mt-4">Nenhuma tarefa encontrada.</p>
                          </div>
                      )}
                  </div>
             </div>
        )}
      </div>

      <TaskModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         taskToEdit={taskToEdit} 
      />
    </div>
  );
}

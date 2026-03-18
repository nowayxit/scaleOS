"use client";

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Tag as TagIcon, Clock, AlignLeft, MessageSquare, Send } from 'lucide-react';
import { Task, TaskPriority, TaskComment } from './TaskCard';
import { useTaskStore } from '@/store/useTaskStore';
import { useAppStore } from '@/store/useAppStore';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null; // null if creating a new task, task obj if editing
}

export function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const { addTask, updateTask, deleteTask, tags, addTag, columns: storeColumns } = useTaskStore();
  const clients = useAppStore(state => state.clients);
  
  // Always fetch fresh columns from DB to avoid stale localStorage IDs
  const [columns, setColumns] = useState(storeColumns);

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  
  const [newTagInput, setNewTagInput] = useState('');
  const [showNewTagOpts, setShowNewTagOpts] = useState(false);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Fetch fresh real columns from DB whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/columns')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.length > 0) {
            setColumns(data);
            // Also sync to store so TaskBoard shows correct column names
            useTaskStore.setState({ columns: data });
          }
        })
        .catch(() => {/* fallback to store columns */});
    }
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setClientId(taskToEdit.clientId);
      setColumnId(taskToEdit.columnId);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setSelectedTags(taskToEdit.tags || []);
      setDescription(taskToEdit.description || '');
      setComments(taskToEdit.comments || []);
    } else {
      // Reset defaults
      setTitle('');
      setClientId(clients[0]?.id || '');
      setColumnId(columns[0]?.id || '');
      setPriority('medium');
      setDueDate('');
      setSelectedTags([]);
      setDescription('');
      setComments([]);
      setNewCommentInput('');
    }
  }, [taskToEdit, isOpen, clients]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !clientId) return;

    const clientName = clients.find(c => c.id === clientId)?.name || 'Cliente';

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title, clientId, clientName, columnId, priority, dueDate: dueDate || undefined, tags: selectedTags, description, comments
      });
    } else {
      addTask({
        title, clientId, clientName, columnId, priority, dueDate: dueDate || undefined, tags: selectedTags, description, comments
      });
    }
    onClose();
  };

  const handleDelete = () => {
      if(taskToEdit && confirm("Tem certeza que deseja excluir esta tarefa?")) {
           deleteTask(taskToEdit.id);
           onClose();
      }
  }

  const toggleTag = (tagId: string) => {
      if(selectedTags.includes(tagId)) {
          setSelectedTags(prev => prev.filter(id => id !== tagId));
      } else {
          setSelectedTags(prev => [...prev, tagId]);
      }
  }

  const handleCreateTag = (colorClass: string) => {
      if(!newTagInput.trim()) return;
      addTag(newTagInput, colorClass);
      setNewTagInput('');
      setShowNewTagOpts(false);
  }

  const handleAddComment = () => {
      if(!newCommentInput.trim()) return;
      setComments(prev => [...prev, {
          id: `comment-${Date.now()}`,
          text: newCommentInput,
          createdAt: new Date().toISOString(),
          createdBy: "Gestor"
      }]);
      setNewCommentInput('');
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#111] border border-card-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-card/50">
          <h2 className="text-lg font-bold text-white flex gap-2 items-center">
            <div className="w-2 h-6 bg-brand-500 rounded-sm shadow-[0_0_10px_rgba(89,115,255,0.4)]"></div>
            {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
             <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            <div className="space-y-1">
                <input 
                    type="text" 
                    placeholder="Título da Tarefa..." 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none text-xl font-medium text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 px-0"
                    autoFocus
                />
            </div>

            <div className="space-y-2">
                 <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex gap-1 items-center">
                    <AlignLeft size={12}/> Descrição
                 </label>
                 <textarea 
                    placeholder="Adicione mais detalhes sobre a tarefa..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500 placeholder:text-muted-foreground/40 resize-none font-mono"
                 />
            </div>

            <div className="grid grid-cols-2 gap-6">
                 {/* Left Column */}
                 <div className="space-y-4">
                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente / Conta</label>
                         <select 
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                            className="w-full bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500"
                         >
                            <option value="" disabled>Selecione um cliente...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                     </div>

                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coluna</label>
                         <select 
                            value={columnId}
                            onChange={e => setColumnId(e.target.value)}
                            className="w-full bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500"
                         >
                            {columns.sort((a,b) => a.order - b.order).map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                         </select>
                     </div>
                 </div>

                 {/* Right Column */}
                 <div className="space-y-4">
                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</label>
                         <select 
                            value={priority}
                            onChange={e => setPriority(e.target.value as TaskPriority)}
                            className="w-full bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500"
                         >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                         </select>
                     </div>

                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex gap-1 items-center"><Clock size={12}/> Prazo (Opcional)</label>
                         <input 
                            type="text" 
                            placeholder="Ex: Hoje, Amanhã, 12/Oct"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500 placeholder:text-muted-foreground/40"
                         />
                     </div>
                 </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-2 pt-4 border-t border-card-border/50">
                 <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex gap-1 items-center">
                    <TagIcon size={12}/> Tags
                 </label>
                 
                 <div className="flex flex-wrap gap-2 mb-3">
                     {tags.map(tag => {
                         const isSelected = selectedTags.includes(tag.id);
                         return (
                             <button 
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${isSelected ? tag.color + ' ring-1 ring-white/30 font-medium' : 'bg-transparent text-muted-foreground border-card-border hover:border-muted-foreground/50'}`}
                             >
                                 {tag.name}
                             </button>
                         )
                     })}
                 </div>

                 <div className="p-3 bg-black/30 border border-card-border/50 rounded-lg">
                     <div className="flex gap-2">
                        <input 
                           type="text"
                           value={newTagInput}
                           onChange={e => setNewTagInput(e.target.value)}
                           onFocus={() => setShowNewTagOpts(true)}
                           placeholder="Criar nova tag..."
                           className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
                        />
                     </div>
                     {showNewTagOpts && newTagInput && (
                         <div className="mt-3 flex gap-2">
                             <button onClick={() => handleCreateTag('bg-brand-500/20 text-brand-300 border-brand-500/30')} className="w-6 h-6 rounded bg-brand-500"></button>
                             <button onClick={() => handleCreateTag('bg-emerald-500/20 text-emerald-300 border-emerald-500/30')} className="w-6 h-6 rounded bg-emerald-500"></button>
                             <button onClick={() => handleCreateTag('bg-rose-500/20 text-rose-300 border-rose-500/30')} className="w-6 h-6 rounded bg-rose-500"></button>
                             <button onClick={() => handleCreateTag('bg-purple-500/20 text-purple-300 border-purple-500/30')} className="w-6 h-6 rounded bg-purple-500"></button>
                             <button onClick={() => handleCreateTag('bg-amber-500/20 text-amber-300 border-amber-500/30')} className="w-6 h-6 rounded bg-amber-500"></button>
                         </div>
                     )}
                 </div>
            </div>

            {/* Comments Section */}
            {taskToEdit && (
                <div className="space-y-4 pt-4 border-t border-card-border/50">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex gap-1 items-center">
                        <MessageSquare size={12}/> Comentários e Atualizações
                    </label>

                    <div className="space-y-3">
                        {comments.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Nenhum comentário adicionado ainda.</p>
                        )}
                        {comments.map(comment => (
                            <div key={comment.id} className="bg-black/30 border border-card-border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1 text-[10px] text-muted-foreground font-mono">
                                    <span className="font-semibold text-brand-300">{comment.createdBy}</span>
                                    <span>{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-foreground">{comment.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 items-center mt-3">
                        <input 
                            type="text"
                            value={newCommentInput}
                            onChange={e => setNewCommentInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            placeholder="Escreva um comentário..."
                            className="flex-1 bg-black/40 border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-500 placeholder:text-muted-foreground/40"
                        />
                        <button 
                            onClick={handleAddComment}
                            disabled={!newCommentInput.trim()}
                            className="bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600 hover:text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
            
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-card-border flex items-center justify-between">
            {taskToEdit ? (
                <button onClick={handleDelete} className="text-status-red text-sm font-medium flex items-center gap-1.5 hover:bg-status-red/10 px-3 py-1.5 rounded-md transition-colors">
                    <Trash2 size={16} /> Excluir
                </button>
            ) : <div></div>}

            <div className="flex gap-3">
               <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 rounded-lg transition-colors border border-transparent">
                  Cancelar
               </button>
               <button onClick={handleSave} disabled={!title.trim() || !clientId} className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-all shadow-[0_0_15px_rgba(89,115,255,0.3)] disabled:opacity-50 disabled:shadow-none flex gap-2 items-center">
                  <Save size={16} />
                  Salvar Tarefa
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}

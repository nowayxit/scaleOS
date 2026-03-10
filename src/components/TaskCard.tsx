import { GripVertical, Clock, MessageSquare, Tag as TagIcon } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientName: string;
  clientId: string;
  columnId: string;
  priority: TaskPriority;
  dueDate?: string;
  comments?: TaskComment[];
  tags?: string[]; // Array of Tag IDs
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityColors = {
  low: 'text-status-green bg-status-green/10 border-status-green/20',
  medium: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  high: 'text-status-red bg-status-red/10 border-status-red/20',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const storeTags = useTaskStore(s => s.tags);
  const taskTags = (task.tags || []).map(tagId => storeTags.find(t => t.id === tagId)).filter(Boolean);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  return (
    <div 
        draggable
        onDragStart={handleDragStart}
        onClick={onClick}
        className="bg-card/80 border border-card-border p-3.5 flex flex-col gap-3 rounded-lg hover:border-brand-500/50 hover:bg-white/[0.04] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[100px]">
                {task.clientName}
            </span>
        </div>
        <GripVertical size={14} className="text-muted-foreground/30 group-hover:text-brand-500/50 transition-colors" />
      </div>
      
      <p className="text-sm font-medium text-foreground leading-snug">
        {task.title}
      </p>

      {/* Tags */}
      {taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
              {taskTags.map(tag => tag && (
                  <span key={tag.id} className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${tag.color}`}>
                      {tag.name}
                  </span>
              ))}
          </div>
      )}

      <div className="flex justify-between items-center mt-1 pt-1">
        <div className="flex gap-3 items-center">
             {task.dueDate && (
                 <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded bg-black/40 border border-card-border ${task.priority === 'high' ? 'text-status-red' : 'text-muted-foreground'}`}>
                    <Clock size={12} />
                    <span>{task.dueDate}</span>
                 </div>
             )}
             {task.comments && task.comments.length > 0 && (
                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
                     <MessageSquare size={12} />
                     <span>{task.comments.length}</span>
                 </div>
             )}
        </div>
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 border border-brand-500/50 flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_10px_rgba(89,115,255,0.4)]">
            G
        </div>
      </div>
    </div>
  );
}

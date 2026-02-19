import Badge from '../common/Badge';

interface Task {
  id: string;
  taskType?: string;
  description?: string;
  priority?: string;
  status?: string;
  scheduledAt?: string;
  manholeId?: string;
  assignedWorkers?: Array<{ name: string }>;
  progress?: number;
}

interface ActiveTasksListProps {
  tasks: Task[];
  onComplete?: (id: string) => void;
}

const priorityVariant: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

export default function ActiveTasksList({ tasks, onComplete }: ActiveTasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No active tasks.
      </div>
    );
  }

  return (
    <div className="card-surface divide-y divide-border">
      {tasks.map((task) => (
        <div key={task.id} className="p-4 hover:bg-surface-hover transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary truncate">
                  {task.taskType?.replace(/_/g, ' ') || 'Task'}: {task.description || task.id}
                </p>
                {task.priority && (
                  <Badge variant={priorityVariant[task.priority] || 'default'}>{task.priority}</Badge>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {task.scheduledAt && `Scheduled: ${new Date(task.scheduledAt).toLocaleString()}`}
                {task.manholeId && ` | Manhole: ${task.manholeId}`}
              </p>
              {task.assignedWorkers && task.assignedWorkers.length > 0 && (
                <p className="text-xs text-text-muted mt-0.5">
                  Workers: {task.assignedWorkers.map((w) => w.name).join(', ')}
                </p>
              )}
            </div>
            {onComplete && (
              <button onClick={() => onComplete(task.id)}
                className="ml-3 px-3 py-1 bg-safe text-white rounded-lg text-xs font-medium hover:bg-safe/80 transition-colors">
                Complete
              </button>
            )}
          </div>
          {typeof task.progress === 'number' && (
            <div className="mt-2">
              <div className="w-full bg-surface-elevated rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all animate-progress-fill"
                  style={{ width: `${Math.min(100, task.progress)}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-0.5 text-right">{task.progress}%</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

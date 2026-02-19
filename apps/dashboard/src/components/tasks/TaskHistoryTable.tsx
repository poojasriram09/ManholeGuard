import Badge from '../common/Badge';

interface HistoryTask {
  id: string;
  taskType?: string;
  description?: string;
  priority?: string;
  status?: string;
  scheduledAt?: string;
  completedAt?: string;
  manholeId?: string;
  assignedWorkers?: Array<{ name: string }>;
}

interface TaskHistoryTableProps {
  tasks: HistoryTask[];
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  COMPLETED: 'success',
  CANCELLED: 'default',
  FAILED: 'danger',
};

export default function TaskHistoryTable({ tasks }: TaskHistoryTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="card-surface p-6 text-center text-text-muted">
        No task history available.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Manhole</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Workers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Scheduled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Completed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-text-primary">{task.taskType?.replace(/_/g, ' ') || 'Task'}</p>
                  {task.description && (
                    <p className="text-xs text-text-muted truncate max-w-[200px]">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{task.manholeId || '-'}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {task.assignedWorkers?.map((w) => w.name).join(', ') || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                  {task.scheduledAt ? new Date(task.scheduledAt).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                  {task.completedAt ? new Date(task.completedAt).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[task.status || ''] || 'default'}>
                    {task.status || 'UNKNOWN'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

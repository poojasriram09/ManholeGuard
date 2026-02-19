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
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No task history available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manhole</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-800">{task.taskType?.replace(/_/g, ' ') || 'Task'}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{task.manholeId || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.assignedWorkers?.map((w) => w.name).join(', ') || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {task.scheduledAt ? new Date(task.scheduledAt).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
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

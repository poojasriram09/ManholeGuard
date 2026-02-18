import { NavLink } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/entries', label: 'Active Entries', icon: '🚧' },
  { to: '/manholes', label: 'Manholes', icon: '🕳️' },
  { to: '/workers', label: 'Workers', icon: '👷' },
  { to: '/heatmap', label: 'Heatmap', icon: '🗺️' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
  { to: '/incidents', label: 'Incidents', icon: '⚠️' },
  { to: '/tasks', label: 'Tasks', icon: '📋' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Sidebar() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all z-30 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-gray-700">
        <h1 className={`font-bold text-lg ${sidebarOpen ? '' : 'text-center text-sm'}`}>
          {sidebarOpen ? 'ManholeGuard' : 'MG'}
        </h1>
      </div>
      <nav className="mt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {sidebarOpen && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

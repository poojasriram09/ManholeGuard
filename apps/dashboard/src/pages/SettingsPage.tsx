import { useState } from 'react';

export default function SettingsPage() {
  const [language, setLanguage] = useState(localStorage.getItem('dashboard_lang') || 'en');
  const [refreshRate, setRefreshRate] = useState(localStorage.getItem('dashboard_refresh') || '30');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('dashboard_lang', language);
    localStorage.setItem('dashboard_refresh', refreshRate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auto-refresh interval (seconds)</label>
          <select value={refreshRate} onChange={(e) => setRefreshRate(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm">
            <option value="10">10s</option>
            <option value="30">30s</option>
            <option value="60">60s</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification Sound</label>
          <select className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm">
            <option value="default">Default</option>
            <option value="urgent">Urgent</option>
            <option value="none">None</option>
          </select>
        </div>

        <button onClick={handleSave} className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm hover:bg-blue-700">
          Save Settings
        </button>
        {saved && <p className="text-green-600 text-sm">Settings saved!</p>}
      </div>
    </div>
  );
}

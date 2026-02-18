import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiRequest<{ data: { token: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('worker-token', res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">ManholeGuard</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Worker Login</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-lg" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-lg" required />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 text-lg font-semibold">Login</button>
        </form>
      </div>
    </div>
  );
}

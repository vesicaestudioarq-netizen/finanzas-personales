import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) { setError(d.error || 'Error al iniciar sesión'); return; }
    login(d.token, d.user);
    nav('/');
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-beige rounded-2xl shadow-xl w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-primary mb-1">Finanzas Personales</h1>
        <p className="text-sm text-gray-500 mb-6">Inicia sesión para continuar</p>
        {error && <p className="bg-red-50 text-danger text-sm p-3 rounded-lg mb-4">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            type="email" placeholder="Email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
          <button className="w-full bg-primary text-beige py-2 rounded-lg font-semibold hover:bg-primary-light transition-colors">
            Ingresar
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta? <Link to="/register" className="text-accent font-medium">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

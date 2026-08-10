import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const links = [
  { to: '/',         icon: '📊', label: 'Resumen' },
  { to: '/ingresos', icon: '💰', label: 'Ingresos' },
  { to: '/gastos',   icon: '💳', label: 'Gastos' },
  { to: '/metas',    icon: '🎯', label: 'Metas' },
  { to: '/deudas',   icon: '📋', label: 'Deudas' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="w-56 bg-primary flex flex-col h-screen shrink-0">
      <div className="p-5 border-b border-primary-light">
        <h1 className="text-beige font-bold text-lg leading-tight">Finanzas<br/>Personales</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-accent text-beige font-semibold' : 'text-beige/70 hover:text-beige hover:bg-primary-light'
              }`
            }
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-light">
        <p className="text-beige text-sm font-medium truncate">{user?.nombre}</p>
        <p className="text-beige/50 text-xs truncate mb-2">{user?.email}</p>
        <button onClick={logout} className="text-beige/70 hover:text-beige text-xs underline">Cerrar sesión</button>
      </div>
    </aside>
  );
}

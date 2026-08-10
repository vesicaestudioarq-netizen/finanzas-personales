import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User { id: number; nombre: string; email: string; }
interface AuthCtx { user: User | null; token: string | null; login: (t: string, u: User) => void; logout: () => void; loading: boolean; }

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('fp_token');
    const u = localStorage.getItem('fp_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const login = (t: string, u: User) => {
    setToken(t); setUser(u);
    localStorage.setItem('fp_token', t);
    localStorage.setItem('fp_user', JSON.stringify(u));
  };
  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
  };

  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

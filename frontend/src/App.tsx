import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IngresosPage from './pages/IngresosPage';
import GastosPage from './pages/GastosPage';
import MetasPage from './pages/MetasPage';
import DeudasPage from './pages/DeudasPage';
import GastosFijosPage from './pages/GastosFijosPage';

function PrivateLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex items-center justify-center h-screen bg-beige"><p className="text-primary">Cargando...</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f7f4]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ingresos" element={<IngresosPage />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/metas" element={<MetasPage />} />
            <Route path="/deudas" element={<DeudasPage />} />
            <Route path="/gastos-fijos" element={<GastosFijosPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

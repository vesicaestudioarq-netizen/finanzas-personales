import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import TransaccionModal from '../components/TransaccionModal';

const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
const mesActual = () => new Date().toISOString().slice(0, 7);

export default function GastosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [mes, setMes] = useState(mesActual());
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });

  const load = () => api.get(`/gastos?mes=${mes}`).then(setItems);
  useEffect(() => { load(); }, [mes]);

  const del = async (id: number) => {
    if (!confirm('¿Eliminar gasto?')) return;
    await api.delete(`/gastos/${id}`);
    load();
  };

  const total = items.reduce((s, i) => s + i.monto, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gastos</h1>
          <p className="text-sm text-gray-500">Total del mes: <span className="text-danger font-semibold">{fmt(total)}</span></p>
        </div>
        <div className="flex gap-3 items-center">
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent" />
          <button onClick={() => setModal({ open: true })}
            className="bg-primary text-beige px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
            + Nuevo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Sin gastos este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(i => (
                <tr key={i.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500">{i.fecha}</td>
                  <td className="px-4 py-3 font-medium">{i.descripcion || '—'}</td>
                  <td className="px-4 py-3">
                    {i.cat_nombre ? <span className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs">{i.cat_icono} {i.cat_nombre}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-danger font-semibold">{fmt(i.monto)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setModal({ open: true, item: i })} className="text-accent hover:text-accent-light mr-3 text-xs">Editar</button>
                    <button onClick={() => del(i.id)} className="text-danger/70 hover:text-danger text-xs">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <TransaccionModal tipo="gasto" item={modal.item} onClose={() => setModal({ open: false })} onSave={() => { setModal({ open: false }); load(); }} />
      )}
    </div>
  );
}

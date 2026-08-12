import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const fmt = (n: number) => '$' + n.toLocaleString('es-AR');

interface Meta { id: number; nombre: string; monto_objetivo: number; monto_actual: number; fecha_limite?: string; color: string; }

function MetaModal({ item, onClose, onSave }: { item?: Meta; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: item?.nombre || '',
    monto_objetivo: item?.monto_objetivo ?? ('' as unknown as number),
    monto_actual: item?.monto_actual ?? ('' as unknown as number),
    fecha_limite: item?.fecha_limite || '',
    color: item?.color || '#195740',
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (item) await api.put(`/metas/${item.id}`, form);
    else await api.post('/metas', form);
    onSave();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-primary mb-4">{item ? 'Editar' : 'Nueva'} meta</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Objetivo</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.monto_objetivo} onChange={e => setForm(f=>({...f,monto_objetivo:e.target.value}))} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ahorrado</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.monto_actual} onChange={e => setForm(f=>({...f,monto_actual:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha límite</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.fecha_limite} onChange={e => setForm(f=>({...f,fecha_limite:e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color</label>
              <input type="color" className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="flex-1 bg-primary text-beige py-2 rounded-lg text-sm font-semibold">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item?: Meta }>({ open: false });

  const load = () => api.get('/metas').then(setMetas);
  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    if (!confirm('¿Eliminar meta?')) return;
    await api.delete(`/metas/${id}`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Metas de ahorro</h1>
        <button onClick={() => setModal({ open: true })}
          className="bg-primary text-beige px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-light">
          + Nueva meta
        </button>
      </div>

      {metas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-400">No tenés metas definidas todavía</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {metas.map(m => {
            const pct = Math.min(100, Math.round((m.monto_actual / m.monto_objetivo) * 100));
            const falta = m.monto_objetivo - m.monto_actual;
            return (
              <div key={m.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{m.nombre}</h3>
                    {m.fecha_limite && <p className="text-xs text-gray-400">Fecha límite: {m.fecha_limite}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold" style={{ color: m.color }}>{pct}%</span>
                    <div className="flex gap-3 mt-1">
                      <button onClick={() => setModal({ open: true, item: m })} className="text-accent text-xs">Editar</button>
                      <button onClick={() => del(m.id)} className="text-danger/70 text-xs">Eliminar</button>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Ahorrado: {fmt(m.monto_actual)}</span>
                  <span>Objetivo: {fmt(m.monto_objetivo)}</span>
                </div>
                {falta > 0 && <p className="text-xs text-gray-400 mt-1">Falta: {fmt(falta)}</p>}
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <MetaModal item={modal.item} onClose={() => setModal({ open: false })} onSave={() => { setModal({ open: false }); load(); }} />
      )}
    </div>
  );
}

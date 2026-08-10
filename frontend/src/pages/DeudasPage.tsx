import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const fmt = (n: number) => '$' + n.toLocaleString('es-AR');

interface Deuda { id: number; nombre: string; monto_total: number; monto_pagado: number; cuotas_total: number; cuotas_pagadas: number; fecha_inicio?: string; estado: string; }

function DeudaModal({ item, onClose, onSave }: { item?: Deuda; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: item?.nombre || '',
    monto_total: item?.monto_total || '',
    monto_pagado: item?.monto_pagado || 0,
    cuotas_total: item?.cuotas_total || 1,
    cuotas_pagadas: item?.cuotas_pagadas || 0,
    fecha_inicio: item?.fecha_inicio || '',
    estado: item?.estado || 'activa',
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (item) await api.put(`/deudas/${item.id}`, form);
    else await api.post('/deudas', form);
    onSave();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-primary mb-4">{item ? 'Editar' : 'Nueva'} deuda</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre / descripción</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Monto total</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.monto_total} onChange={e => setForm(f=>({...f,monto_total:e.target.value}))} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pagado</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.monto_pagado} onChange={e => setForm(f=>({...f,monto_pagado:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cuotas totales</label>
              <input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.cuotas_total} onChange={e => setForm(f=>({...f,cuotas_total:Number(e.target.value)}))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cuotas pagadas</label>
              <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.cuotas_pagadas} onChange={e => setForm(f=>({...f,cuotas_pagadas:Number(e.target.value)}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.fecha_inicio} onChange={e => setForm(f=>({...f,fecha_inicio:e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Estado</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.estado} onChange={e => setForm(f=>({...f,estado:e.target.value}))}>
                <option value="activa">Activa</option>
                <option value="pagada">Pagada</option>
              </select>
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

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item?: Deuda }>({ open: false });

  const load = () => api.get('/deudas').then(setDeudas);
  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    if (!confirm('¿Eliminar deuda?')) return;
    await api.delete(`/deudas/${id}`);
    load();
  };

  const activas  = deudas.filter(d => d.estado === 'activa');
  const pagadas  = deudas.filter(d => d.estado === 'pagada');
  const totalDeuda = activas.reduce((s,d) => s + (d.monto_total - d.monto_pagado), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Deudas</h1>
          {activas.length > 0 && <p className="text-sm text-gray-500">Pendiente: <span className="text-danger font-semibold">{fmt(totalDeuda)}</span></p>}
        </div>
        <button onClick={() => setModal({ open: true })}
          className="bg-primary text-beige px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-light">
          + Nueva deuda
        </button>
      </div>

      {deudas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-400">No tenés deudas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activas.map(d => {
            const pendiente = d.monto_total - d.monto_pagado;
            const pct = Math.round((d.monto_pagado / d.monto_total) * 100);
            return (
              <div key={d.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{d.nombre}</h3>
                    {d.cuotas_total > 1 && <p className="text-xs text-gray-400">{d.cuotas_pagadas} de {d.cuotas_total} cuotas</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-danger">{fmt(pendiente)}</p>
                    <p className="text-xs text-gray-400">de {fmt(d.monto_total)}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal({ open: true, item: d })} className="text-accent text-xs">Editar</button>
                  <button onClick={() => del(d.id)} className="text-danger/70 text-xs">Eliminar</button>
                </div>
              </div>
            );
          })}

          {pagadas.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-2 mt-4">Pagadas</p>
              {pagadas.map(d => (
                <div key={d.id} className="bg-gray-50 rounded-xl p-4 mb-2 flex justify-between items-center opacity-60">
                  <span className="text-sm font-medium line-through text-gray-500">{d.nombre}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-gray-400">{fmt(d.monto_total)}</span>
                    <button onClick={() => setModal({ open: true, item: d })} className="text-accent text-xs">Editar</button>
                    <button onClick={() => del(d.id)} className="text-danger/70 text-xs">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <DeudaModal item={modal.item} onClose={() => setModal({ open: false })} onSave={() => { setModal({ open: false }); load(); }} />
      )}
    </div>
  );
}

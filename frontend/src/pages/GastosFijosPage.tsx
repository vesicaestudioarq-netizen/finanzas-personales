import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
const mesActual = () => new Date().toISOString().slice(0, 7);

interface GastoFijo {
  id: number;
  nombre: string;
  monto: number;
  dia_vencimiento: number;
  cat_nombre?: string;
  cat_icono?: string;
  categoria_id?: number;
}

interface PagoMes extends GastoFijo {
  pagado: number;
  fecha_pago?: string;
  pago_id?: number;
}

function GastoFijoModal({ item, onClose, onSave }: { item?: GastoFijo; onClose: () => void; onSave: () => void }) {
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({
    nombre: item?.nombre || '',
    monto: item?.monto || '',
    categoria_id: item?.categoria_id || '',
    dia_vencimiento: item?.dia_vencimiento || 1,
  });

  useEffect(() => {
    api.get('/categorias').then((all: any[]) => setCats(all.filter(c => c.tipo === 'gasto')));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (item) await api.put(`/gastos-fijos/${item.id}`, form);
    else await api.post('/gastos-fijos', form);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-primary mb-4">{item ? 'Editar' : 'Nuevo'} gasto fijo</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Monto</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Día de vencimiento</label>
              <input type="number" min="1" max="31" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                value={form.dia_vencimiento} onChange={e => setForm(f => ({ ...f, dia_vencimiento: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}>
              <option value="">Sin categoría</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
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

export default function GastosFijosPage() {
  const [mes, setMes] = useState(mesActual());
  const [pagos, setPagos] = useState<PagoMes[]>([]);
  const [fijos, setFijos] = useState<GastoFijo[]>([]);
  const [tab, setTab] = useState<'mes' | 'configurar'>('mes');
  const [modal, setModal] = useState<{ open: boolean; item?: GastoFijo }>({ open: false });
  const [toggling, setToggling] = useState<number | null>(null);

  const loadMes    = () => api.get(`/gastos-fijos/mes/${mes}`).then(setPagos);
  const loadFijos  = () => api.get('/gastos-fijos').then(setFijos);

  useEffect(() => { loadMes(); }, [mes]);
  useEffect(() => { if (tab === 'configurar') loadFijos(); }, [tab]);

  const toggle = async (id: number) => {
    setToggling(id);
    await api.post(`/gastos-fijos/mes/${mes}/${id}/toggle`, {});
    await loadMes();
    setToggling(null);
  };

  const del = async (id: number) => {
    if (!confirm('¿Eliminar este gasto fijo?')) return;
    await api.delete(`/gastos-fijos/${id}`);
    loadFijos();
  };

  const totalFijos    = pagos.reduce((s, p) => s + p.monto, 0);
  const totalPagado   = pagos.filter(p => p.pagado).reduce((s, p) => s + p.monto, 0);
  const totalPendiente = totalFijos - totalPagado;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Gastos Fijos</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('mes')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'mes' ? 'bg-primary text-beige' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            Este mes
          </button>
          <button onClick={() => setTab('configurar')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'configurar' ? 'bg-primary text-beige' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            Configurar
          </button>
        </div>
      </div>

      {tab === 'mes' && (
        <>
          <div className="flex items-center gap-3">
            <input type="month" value={mes} onChange={e => setMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent" />
          </div>

          {/* Resumen */}
          {pagos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Total fijos</p>
                <p className="text-lg font-bold text-gray-700">{fmt(totalFijos)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Pagado</p>
                <p className="text-lg font-bold text-success">{fmt(totalPagado)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Pendiente</p>
                <p className="text-lg font-bold text-danger">{fmt(totalPendiente)}</p>
              </div>
            </div>
          )}

          {/* Lista del mes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {pagos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No tenés gastos fijos configurados</p>
                <button onClick={() => setTab('configurar')} className="text-accent text-sm underline">Configurar ahora</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pagos.map(p => (
                  <div key={p.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${p.pagado ? 'bg-green-50/40' : ''}`}>
                    <button
                      onClick={() => toggle(p.id)}
                      disabled={toggling === p.id}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        p.pagado
                          ? 'bg-success border-success text-white'
                          : 'border-gray-300 hover:border-accent'
                      }`}
                    >
                      {p.pagado && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${p.pagado ? 'line-through text-gray-400' : 'text-gray-800'}`}>{p.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.cat_icono && <span className="text-xs text-gray-400">{p.cat_icono} {p.cat_nombre}</span>}
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">Vence día {p.dia_vencimiento}</span>
                        {p.pagado && p.fecha_pago && (
                          <><span className="text-xs text-gray-300">·</span><span className="text-xs text-success">Pagado</span></>
                        )}
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${p.pagado ? 'text-gray-400' : 'text-danger'}`}>{fmt(p.monto)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'configurar' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setModal({ open: true })}
              className="bg-primary text-beige px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-light">
              + Agregar
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {fijos.length === 0 ? (
              <p className="text-center text-gray-400 py-12">Sin gastos fijos configurados</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-center">Vence día</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fijos.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{f.nombre}</td>
                      <td className="px-4 py-3 text-gray-500">{f.cat_icono} {f.cat_nombre || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{f.dia_vencimiento}</td>
                      <td className="px-4 py-3 text-right font-semibold text-danger">{fmt(f.monto)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setModal({ open: true, item: f })} className="text-accent text-xs mr-3">Editar</button>
                        <button onClick={() => del(f.id)} className="text-danger/70 text-xs">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {modal.open && (
        <GastoFijoModal
          item={modal.item}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); loadFijos(); if (tab === 'mes') loadMes(); }}
        />
      )}
    </div>
  );
}

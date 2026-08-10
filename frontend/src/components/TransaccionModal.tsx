import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Props {
  tipo: 'ingreso' | 'gasto';
  item?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function TransaccionModal({ tipo, item, onClose, onSave }: Props) {
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({
    fecha: item?.fecha || new Date().toISOString().slice(0,10),
    monto: item?.monto || '',
    descripcion: item?.descripcion || '',
    categoria_id: item?.categoria_id || '',
  });

  useEffect(() => {
    api.get('/categorias').then((all: any[]) => setCats(all.filter(c => c.tipo === tipo)));
  }, [tipo]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = tipo === 'ingreso' ? '/ingresos' : '/gastos';
    if (item) await api.put(`${path}/${item.id}`, form);
    else await api.post(path, form);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-primary mb-4">{item ? 'Editar' : 'Nuevo'} {tipo}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f=>({...f,fecha:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Monto</label>
              <input type="number" step="0.01" value={form.monto} onChange={e => setForm(f=>({...f,monto:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
            <input type="text" value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
            <select value={form.categoria_id} onChange={e => setForm(f=>({...f,categoria_id:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
              <option value="">Sin categoría</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-primary text-beige py-2 rounded-lg text-sm font-semibold hover:bg-primary-light">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

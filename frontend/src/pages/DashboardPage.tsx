import { useState, useEffect } from 'react';
import { api, exportarExcel } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const fmt = (n: number) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
const mesActual = () => new Date().toISOString().slice(0, 7);

export default function DashboardPage() {
  const [mes, setMes] = useState(mesActual());
  const [data, setData] = useState<any>(null);

  useEffect(() => { api.get(`/resumen?mes=${mes}`).then(setData); }, [mes]);

  if (!data) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Cargando...</p></div>;

  const { totalIngresos, totalGastos, saldo, gastosCat, historial, metas, deudas, totalDeuda } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Resumen</h1>
          <p className="text-sm text-gray-500">Vista financiera personal</p>
        </div>
        <div className="flex gap-3 items-center">
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent" />
          <button onClick={exportarExcel} className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm hover:bg-accent-light transition-colors">
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Ingresos del mes</p>
          <p className="text-2xl font-bold text-success">{fmt(totalIngresos)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Gastos del mes</p>
          <p className="text-2xl font-bold text-danger">{fmt(totalGastos)}</p>
        </div>
        <div className={`rounded-xl p-5 shadow-sm border ${saldo >= 0 ? 'bg-primary border-primary-light' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-xs mb-1 ${saldo >= 0 ? 'text-beige/70' : 'text-red-400'}`}>Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-beige' : 'text-danger'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-primary mb-4">Últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historial}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#195740" radius={[4,4,0,0]} />
              <Bar dataKey="gastos"   name="Gastos"   fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-primary mb-4">Gastos por categoría</h2>
          {gastosCat.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">Sin gastos este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gastosCat} dataKey="total" nameKey="nombre" cx="50%" cy="50%" outerRadius={70} label={false}>
                  {gastosCat.map((c: any, i: number) => <Cell key={i} fill={c.color || '#4C857F'} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend iconSize={10} formatter={(v) => <span style={{fontSize:11}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Metas */}
      {metas.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-primary mb-4">Metas de ahorro</h2>
          <div className="space-y-3">
            {metas.map((m: any) => {
              const pct = Math.min(100, Math.round((m.monto_actual / m.monto_objetivo) * 100));
              return (
                <div key={m.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{m.nombre}</span>
                    <span className="text-gray-500">{fmt(m.monto_actual)} / {fmt(m.monto_objetivo)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m.color || '#195740' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deudas activas */}
      {deudas.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-primary">Deudas activas</h2>
            <span className="text-danger font-semibold">{fmt(totalDeuda)}</span>
          </div>
          <div className="space-y-2">
            {deudas.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium">{d.nombre}</span>
                <div className="text-right">
                  <span className="text-sm text-danger font-semibold">{fmt(d.monto_total - d.monto_pagado)}</span>
                  {d.cuotas_total > 1 && <span className="text-xs text-gray-400 ml-2">{d.cuotas_pagadas}/{d.cuotas_total} cuotas</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

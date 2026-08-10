const express = require('express');
const router = express.Router();
const { db } = require('../db');
const XLSX = require('xlsx');

// ── CATEGORÍAS ──────────────────────────────────────────────
router.get('/categorias', (req, res) => {
  res.json(db.prepare('SELECT * FROM categorias WHERE usuario_id=? ORDER BY tipo,nombre').all(req.user.id));
});
router.post('/categorias', (req, res) => {
  const { nombre, tipo, color, icono } = req.body;
  const r = db.prepare('INSERT INTO categorias (usuario_id,nombre,tipo,color,icono) VALUES (?,?,?,?,?)').run(req.user.id, nombre, tipo, color||'#4C857F', icono||'📦');
  res.json({ id: r.lastInsertRowid });
});
router.put('/categorias/:id', (req, res) => {
  const { nombre, color, icono } = req.body;
  db.prepare('UPDATE categorias SET nombre=?,color=?,icono=? WHERE id=? AND usuario_id=?').run(nombre, color, icono, req.params.id, req.user.id);
  res.json({ ok: true });
});
router.delete('/categorias/:id', (req, res) => {
  db.prepare('DELETE FROM categorias WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── INGRESOS ────────────────────────────────────────────────
router.get('/ingresos', (req, res) => {
  const { mes } = req.query;
  const where = mes ? `AND strftime('%Y-%m', fecha)=?` : '';
  const params = mes ? [req.user.id, mes] : [req.user.id];
  const rows = db.prepare(`
    SELECT i.*, c.nombre as cat_nombre, c.color as cat_color, c.icono as cat_icono
    FROM ingresos i LEFT JOIN categorias c ON c.id=i.categoria_id
    WHERE i.usuario_id=? ${where} ORDER BY i.fecha DESC
  `).all(...params);
  res.json(rows);
});
router.post('/ingresos', (req, res) => {
  const { fecha, monto, descripcion, categoria_id } = req.body;
  const r = db.prepare('INSERT INTO ingresos (usuario_id,fecha,monto,descripcion,categoria_id) VALUES (?,?,?,?,?)').run(req.user.id, fecha, monto, descripcion, categoria_id||null);
  res.json({ id: r.lastInsertRowid });
});
router.put('/ingresos/:id', (req, res) => {
  const { fecha, monto, descripcion, categoria_id } = req.body;
  db.prepare('UPDATE ingresos SET fecha=?,monto=?,descripcion=?,categoria_id=? WHERE id=? AND usuario_id=?').run(fecha, monto, descripcion, categoria_id||null, req.params.id, req.user.id);
  res.json({ ok: true });
});
router.delete('/ingresos/:id', (req, res) => {
  db.prepare('DELETE FROM ingresos WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── GASTOS ──────────────────────────────────────────────────
router.get('/gastos', (req, res) => {
  const { mes } = req.query;
  const where = mes ? `AND strftime('%Y-%m', fecha)=?` : '';
  const params = mes ? [req.user.id, mes] : [req.user.id];
  const rows = db.prepare(`
    SELECT g.*, c.nombre as cat_nombre, c.color as cat_color, c.icono as cat_icono
    FROM gastos g LEFT JOIN categorias c ON c.id=g.categoria_id
    WHERE g.usuario_id=? ${where} ORDER BY g.fecha DESC
  `).all(...params);
  res.json(rows);
});
router.post('/gastos', (req, res) => {
  const { fecha, monto, descripcion, categoria_id } = req.body;
  const r = db.prepare('INSERT INTO gastos (usuario_id,fecha,monto,descripcion,categoria_id) VALUES (?,?,?,?,?)').run(req.user.id, fecha, monto, descripcion, categoria_id||null);
  res.json({ id: r.lastInsertRowid });
});
router.put('/gastos/:id', (req, res) => {
  const { fecha, monto, descripcion, categoria_id } = req.body;
  db.prepare('UPDATE gastos SET fecha=?,monto=?,descripcion=?,categoria_id=? WHERE id=? AND usuario_id=?').run(fecha, monto, descripcion, categoria_id||null, req.params.id, req.user.id);
  res.json({ ok: true });
});
router.delete('/gastos/:id', (req, res) => {
  db.prepare('DELETE FROM gastos WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── METAS ───────────────────────────────────────────────────
router.get('/metas', (req, res) => {
  res.json(db.prepare('SELECT * FROM metas WHERE usuario_id=? ORDER BY created_at DESC').all(req.user.id));
});
router.post('/metas', (req, res) => {
  const { nombre, monto_objetivo, monto_actual, fecha_limite, color } = req.body;
  const r = db.prepare('INSERT INTO metas (usuario_id,nombre,monto_objetivo,monto_actual,fecha_limite,color) VALUES (?,?,?,?,?,?)').run(req.user.id, nombre, monto_objetivo, monto_actual||0, fecha_limite||null, color||'#195740');
  res.json({ id: r.lastInsertRowid });
});
router.put('/metas/:id', (req, res) => {
  const { nombre, monto_objetivo, monto_actual, fecha_limite, color } = req.body;
  db.prepare('UPDATE metas SET nombre=?,monto_objetivo=?,monto_actual=?,fecha_limite=?,color=? WHERE id=? AND usuario_id=?').run(nombre, monto_objetivo, monto_actual, fecha_limite||null, color, req.params.id, req.user.id);
  res.json({ ok: true });
});
router.delete('/metas/:id', (req, res) => {
  db.prepare('DELETE FROM metas WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── DEUDAS ──────────────────────────────────────────────────
router.get('/deudas', (req, res) => {
  res.json(db.prepare('SELECT * FROM deudas WHERE usuario_id=? ORDER BY created_at DESC').all(req.user.id));
});
router.post('/deudas', (req, res) => {
  const { nombre, monto_total, cuotas_total, fecha_inicio } = req.body;
  const r = db.prepare('INSERT INTO deudas (usuario_id,nombre,monto_total,cuotas_total,fecha_inicio) VALUES (?,?,?,?,?)').run(req.user.id, nombre, monto_total, cuotas_total||1, fecha_inicio||null);
  res.json({ id: r.lastInsertRowid });
});
router.put('/deudas/:id', (req, res) => {
  const { nombre, monto_total, monto_pagado, cuotas_total, cuotas_pagadas, estado } = req.body;
  db.prepare('UPDATE deudas SET nombre=?,monto_total=?,monto_pagado=?,cuotas_total=?,cuotas_pagadas=?,estado=? WHERE id=? AND usuario_id=?').run(nombre, monto_total, monto_pagado, cuotas_total, cuotas_pagadas, estado, req.params.id, req.user.id);
  res.json({ ok: true });
});
router.delete('/deudas/:id', (req, res) => {
  db.prepare('DELETE FROM deudas WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── RESUMEN MENSUAL ─────────────────────────────────────────
router.get('/resumen', (req, res) => {
  const { mes } = req.query;
  const uid = req.user.id;
  const where = mes ? `AND strftime('%Y-%m', fecha)=?` : '';
  const p = (extra=[]) => [uid, ...(mes ? [mes] : []), ...extra];

  const totalIngresos = db.prepare(`SELECT COALESCE(SUM(monto),0) as t FROM ingresos WHERE usuario_id=? ${where}`).get(...p()).t;
  const totalGastos   = db.prepare(`SELECT COALESCE(SUM(monto),0) as t FROM gastos   WHERE usuario_id=? ${where}`).get(...p()).t;
  const saldo = totalIngresos - totalGastos;

  const gastosCat = db.prepare(`
    SELECT c.nombre, c.color, c.icono, COALESCE(SUM(g.monto),0) as total
    FROM gastos g LEFT JOIN categorias c ON c.id=g.categoria_id
    WHERE g.usuario_id=? ${where}
    GROUP BY g.categoria_id ORDER BY total DESC
  `).all(...p());

  const historial = db.prepare(`
    SELECT strftime('%Y-%m', fecha) as mes,
      SUM(CASE WHEN tipo='ingreso' THEN monto ELSE 0 END) as ingresos,
      SUM(CASE WHEN tipo='gasto'   THEN monto ELSE 0 END) as gastos
    FROM (
      SELECT fecha, monto, 'ingreso' as tipo FROM ingresos WHERE usuario_id=?
      UNION ALL
      SELECT fecha, monto, 'gasto'   as tipo FROM gastos   WHERE usuario_id=?
    ) GROUP BY mes ORDER BY mes DESC LIMIT 6
  `).all(uid, uid).reverse();

  const metas  = db.prepare('SELECT * FROM metas  WHERE usuario_id=? ORDER BY created_at DESC').all(uid);
  const deudas = db.prepare("SELECT * FROM deudas WHERE usuario_id=? AND estado='activa'").all(uid);
  const totalDeuda = deudas.reduce((s,d) => s + (d.monto_total - d.monto_pagado), 0);

  res.json({ totalIngresos, totalGastos, saldo, gastosCat, historial, metas, deudas, totalDeuda });
});

// ── EXPORTAR ────────────────────────────────────────────────
router.get('/exportar', (req, res) => {
  const uid = req.user.id;
  const ing = db.prepare(`SELECT i.fecha,i.monto,i.descripcion,c.nombre as categoria FROM ingresos i LEFT JOIN categorias c ON c.id=i.categoria_id WHERE i.usuario_id=? ORDER BY i.fecha`).all(uid);
  const gas = db.prepare(`SELECT g.fecha,g.monto,g.descripcion,c.nombre as categoria FROM gastos g LEFT JOIN categorias c ON c.id=g.categoria_id WHERE g.usuario_id=? ORDER BY g.fecha`).all(uid);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ing.map(r => ({ Fecha:r.fecha, Monto:r.monto, Descripción:r.descripcion, Categoría:r.categoria }))), 'Ingresos');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gas.map(r => ({ Fecha:r.fecha, Monto:r.monto, Descripción:r.descripcion, Categoría:r.categoria }))), 'Gastos');
  const buf = XLSX.write(wb, { type:'buffer', bookType:'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="finanzas-personales.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

module.exports = router;

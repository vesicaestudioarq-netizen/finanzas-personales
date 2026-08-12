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

// ── GASTOS FIJOS ────────────────────────────────────────────
const { db: dbRef } = require('../db');

router.get('/gastos-fijos', (req, res) => {
  const rows = dbRef.prepare(`
    SELECT gf.*, c.nombre as cat_nombre, c.icono as cat_icono
    FROM gastos_fijos gf LEFT JOIN categorias c ON c.id = gf.categoria_id
    WHERE gf.usuario_id = ? AND gf.activo = 1
    ORDER BY gf.dia_vencimiento
  `).all(req.user.id);
  res.json(rows);
});

router.post('/gastos-fijos', (req, res) => {
  try {
    const { nombre, monto, categoria_id, dia_vencimiento } = req.body;
    const r = dbRef.prepare(
      'INSERT INTO gastos_fijos (usuario_id, nombre, monto, categoria_id, dia_vencimiento) VALUES (?,?,?,?,?)'
    ).run(req.user.id, nombre, monto, categoria_id || null, dia_vencimiento || 1);
    res.json({ id: r.lastInsertRowid });
  } catch (err) {
    console.error('gastos-fijos POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/gastos-fijos/:id', (req, res) => {
  const { nombre, monto, categoria_id, dia_vencimiento } = req.body;
  dbRef.prepare(
    'UPDATE gastos_fijos SET nombre=?, monto=?, categoria_id=?, dia_vencimiento=? WHERE id=? AND usuario_id=?'
  ).run(nombre, monto, categoria_id || null, dia_vencimiento || 1, req.params.id, req.user.id);
  res.json({ ok: true });
});

router.delete('/gastos-fijos/:id', (req, res) => {
  dbRef.prepare('UPDATE gastos_fijos SET activo=0 WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

router.get('/gastos-fijos/mes/:mes', (req, res) => {
  const { mes } = req.params;
  const uid = req.user.id;
  const fijos = dbRef.prepare('SELECT * FROM gastos_fijos WHERE usuario_id=? AND activo=1').all(uid);
  const insertPago = dbRef.prepare('INSERT OR IGNORE INTO gastos_fijos_pagos (gasto_fijo_id, usuario_id, mes) VALUES (?,?,?)');
  fijos.forEach(gf => insertPago.run(gf.id, uid, mes));
  const rows = dbRef.prepare(`
    SELECT gf.id, gf.nombre, gf.monto, gf.dia_vencimiento,
           c.nombre as cat_nombre, c.icono as cat_icono,
           COALESCE(p.pagado, 0) as pagado, p.fecha_pago, p.id as pago_id
    FROM gastos_fijos gf
    LEFT JOIN categorias c ON c.id = gf.categoria_id
    LEFT JOIN gastos_fijos_pagos p ON p.gasto_fijo_id = gf.id AND p.mes = ?
    WHERE gf.usuario_id = ? AND gf.activo = 1
    ORDER BY gf.dia_vencimiento
  `).all(mes, uid);
  res.json(rows);
});

router.post('/gastos-fijos/mes/:mes/:id/toggle', (req, res) => {
  const { mes, id } = req.params;
  const uid = req.user.id;
  const pago = dbRef.prepare('SELECT * FROM gastos_fijos_pagos WHERE gasto_fijo_id=? AND mes=? AND usuario_id=?').get(id, mes, uid);
  const gf = dbRef.prepare('SELECT * FROM gastos_fijos WHERE id=? AND usuario_id=?').get(id, uid);
  if (!gf) return res.status(404).json({ error: 'No encontrado' });

  if (!pago || !pago.pagado) {
    const fecha = `${mes}-${String(gf.dia_vencimiento).padStart(2, '0')}`;
    const gastoR = dbRef.prepare(
      'INSERT INTO gastos (usuario_id, fecha, monto, descripcion, categoria_id) VALUES (?,?,?,?,?)'
    ).run(uid, fecha, gf.monto, gf.nombre, gf.categoria_id || null);
    dbRef.prepare(`
      INSERT INTO gastos_fijos_pagos (gasto_fijo_id, usuario_id, mes, pagado, gasto_id, fecha_pago)
      VALUES (?,?,?,1,?,datetime('now'))
      ON CONFLICT(gasto_fijo_id, mes) DO UPDATE SET pagado=1, gasto_id=?, fecha_pago=datetime('now')
    `).run(id, uid, mes, gastoR.lastInsertRowid, gastoR.lastInsertRowid);
    res.json({ pagado: true });
  } else {
    if (pago.gasto_id) dbRef.prepare('DELETE FROM gastos WHERE id=? AND usuario_id=?').run(pago.gasto_id, uid);
    dbRef.prepare('UPDATE gastos_fijos_pagos SET pagado=0, gasto_id=NULL, fecha_pago=NULL WHERE gasto_fijo_id=? AND mes=? AND usuario_id=?').run(id, mes, uid);
    res.json({ pagado: false });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Listar gastos fijos configurados
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT gf.*, c.nombre as cat_nombre, c.icono as cat_icono
    FROM gastos_fijos gf LEFT JOIN categorias c ON c.id = gf.categoria_id
    WHERE gf.usuario_id = ? AND gf.activo = 1
    ORDER BY gf.dia_vencimiento
  `).all(req.user.id);
  res.json(rows);
});

// Crear gasto fijo
router.post('/', (req, res) => {
  const { nombre, monto, categoria_id, dia_vencimiento } = req.body;
  const r = db.prepare(
    'INSERT INTO gastos_fijos (usuario_id, nombre, monto, categoria_id, dia_vencimiento) VALUES (?,?,?,?,?)'
  ).run(req.user.id, nombre, monto, categoria_id || null, dia_vencimiento || 1);
  res.json({ id: r.lastInsertRowid });
});

// Editar gasto fijo
router.put('/:id', (req, res) => {
  const { nombre, monto, categoria_id, dia_vencimiento } = req.body;
  db.prepare(
    'UPDATE gastos_fijos SET nombre=?, monto=?, categoria_id=?, dia_vencimiento=? WHERE id=? AND usuario_id=?'
  ).run(nombre, monto, categoria_id || null, dia_vencimiento || 1, req.params.id, req.user.id);
  res.json({ ok: true });
});

// Eliminar gasto fijo (soft delete)
router.delete('/:id', (req, res) => {
  db.prepare('UPDATE gastos_fijos SET activo=0 WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// Obtener estado de pagos de un mes (crea registros pendientes si no existen)
router.get('/mes/:mes', (req, res) => {
  const { mes } = req.params;
  const uid = req.user.id;

  const fijos = db.prepare(
    'SELECT * FROM gastos_fijos WHERE usuario_id=? AND activo=1'
  ).all(uid);

  // Crear registros pendientes para los que no existen aún
  const insertPago = db.prepare(
    'INSERT OR IGNORE INTO gastos_fijos_pagos (gasto_fijo_id, usuario_id, mes) VALUES (?,?,?)'
  );
  fijos.forEach(gf => insertPago.run(gf.id, uid, mes));

  // Devolver estado completo
  const rows = db.prepare(`
    SELECT gf.id, gf.nombre, gf.monto, gf.dia_vencimiento,
           c.nombre as cat_nombre, c.icono as cat_icono,
           COALESCE(p.pagado, 0) as pagado,
           p.fecha_pago, p.id as pago_id
    FROM gastos_fijos gf
    LEFT JOIN categorias c ON c.id = gf.categoria_id
    LEFT JOIN gastos_fijos_pagos p ON p.gasto_fijo_id = gf.id AND p.mes = ?
    WHERE gf.usuario_id = ? AND gf.activo = 1
    ORDER BY gf.dia_vencimiento
  `).all(mes, uid);

  res.json(rows);
});

// Marcar como pagado (crea gasto real) o desmarcar
router.post('/mes/:mes/:id/toggle', (req, res) => {
  const { mes, id } = req.params;
  const uid = req.user.id;

  const pago = db.prepare(
    'SELECT * FROM gastos_fijos_pagos WHERE gasto_fijo_id=? AND mes=? AND usuario_id=?'
  ).get(id, mes, uid);

  const gf = db.prepare('SELECT * FROM gastos_fijos WHERE id=? AND usuario_id=?').get(id, uid);
  if (!gf) return res.status(404).json({ error: 'No encontrado' });

  if (!pago || !pago.pagado) {
    // Marcar como pagado: crear gasto real
    const fecha = `${mes}-${String(gf.dia_vencimiento).padStart(2, '0')}`;
    const gastoR = db.prepare(
      'INSERT INTO gastos (usuario_id, fecha, monto, descripcion, categoria_id) VALUES (?,?,?,?,?)'
    ).run(uid, fecha, gf.monto, gf.nombre, gf.categoria_id || null);

    db.prepare(`
      INSERT INTO gastos_fijos_pagos (gasto_fijo_id, usuario_id, mes, pagado, gasto_id, fecha_pago)
      VALUES (?,?,?,1,?,datetime('now'))
      ON CONFLICT(gasto_fijo_id, mes) DO UPDATE SET pagado=1, gasto_id=?, fecha_pago=datetime('now')
    `).run(id, uid, mes, gastoR.lastInsertRowid, gastoR.lastInsertRowid);

    res.json({ pagado: true });
  } else {
    // Desmarcar: eliminar gasto real si existe
    if (pago.gasto_id) {
      db.prepare('DELETE FROM gastos WHERE id=? AND usuario_id=?').run(pago.gasto_id, uid);
    }
    db.prepare(
      'UPDATE gastos_fijos_pagos SET pagado=0, gasto_id=NULL, fecha_pago=NULL WHERE gasto_fijo_id=? AND mes=? AND usuario_id=?'
    ).run(id, mes, uid);

    res.json({ pagado: false });
  }
});

module.exports = router;

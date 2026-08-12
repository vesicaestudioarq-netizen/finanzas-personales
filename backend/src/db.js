const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'finanzas.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    color TEXT DEFAULT '#4C857F',
    icono TEXT DEFAULT '💰',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ingresos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    monto REAL NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );

  CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    monto REAL NOT NULL,
    descripcion TEXT NOT NULL,
    categoria_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );

  CREATE TABLE IF NOT EXISTS metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    monto_objetivo REAL NOT NULL,
    monto_actual REAL DEFAULT 0,
    fecha_limite TEXT,
    color TEXT DEFAULT '#195740',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS deudas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    monto_total REAL NOT NULL,
    monto_pagado REAL DEFAULT 0,
    cuotas_total INTEGER DEFAULT 1,
    cuotas_pagadas INTEGER DEFAULT 0,
    fecha_inicio TEXT,
    estado TEXT DEFAULT 'activa',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS gastos_fijos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria_id INTEGER,
    dia_vencimiento INTEGER DEFAULT 1,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  );

  CREATE TABLE IF NOT EXISTS gastos_fijos_pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gasto_fijo_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    mes TEXT NOT NULL,
    pagado INTEGER DEFAULT 0,
    gasto_id INTEGER,
    fecha_pago TEXT,
    UNIQUE(gasto_fijo_id, mes),
    FOREIGN KEY (gasto_fijo_id) REFERENCES gastos_fijos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
`);

// Categorías por defecto para usuarios nuevos
function crearCategoriasDefault(usuarioId) {
  const cats = [
    { nombre: 'Sueldo', tipo: 'ingreso', color: '#195740', icono: '💼' },
    { nombre: 'Freelance', tipo: 'ingreso', color: '#4C857F', icono: '💻' },
    { nombre: 'Otros ingresos', tipo: 'ingreso', color: '#10b981', icono: '💰' },
    { nombre: 'Vivienda', tipo: 'gasto', color: '#6366f1', icono: '🏠' },
    { nombre: 'Comida', tipo: 'gasto', color: '#f59e0b', icono: '🍔' },
    { nombre: 'Transporte', tipo: 'gasto', color: '#3b82f6', icono: '🚌' },
    { nombre: 'Salud', tipo: 'gasto', color: '#ef4444', icono: '❤️' },
    { nombre: 'Educación', tipo: 'gasto', color: '#8b5cf6', icono: '📚' },
    { nombre: 'Ropa', tipo: 'gasto', color: '#ec4899', icono: '👗' },
    { nombre: 'Entretenimiento', tipo: 'gasto', color: '#f97316', icono: '🎉' },
    { nombre: 'Servicios', tipo: 'gasto', color: '#64748b', icono: '💡' },
    { nombre: 'Otros gastos', tipo: 'gasto', color: '#94a3b8', icono: '📦' },
  ];
  const stmt = db.prepare('INSERT INTO categorias (usuario_id, nombre, tipo, color, icono) VALUES (?,?,?,?,?)');
  cats.forEach(c => stmt.run(usuarioId, c.nombre, c.tipo, c.color, c.icono));
}

module.exports = { db, crearCategoriasDefault };

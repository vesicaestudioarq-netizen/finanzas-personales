const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, crearCategoriasDefault } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'finanzas-personales-secret-2026';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Sin autorización' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

router.post('/register', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos' });
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) return res.status(409).json({ error: 'El email ya está registrado' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?,?,?)').run(nombre, email, hash);
  crearCategoriasDefault(result.lastInsertRowid);
  res.json({ id: result.lastInsertRowid, nombre, email });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  const token = jwt.sign({ id: user.id, nombre: user.nombre, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
});

router.get('/me', authMiddleware, (req, res) => res.json(req.user));

module.exports = { router, authMiddleware };

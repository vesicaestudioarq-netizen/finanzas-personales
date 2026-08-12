const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const { router: authRouter, authMiddleware } = require('./routes/auth');
const datosRouter = require('./routes/datos');

app.use('/api/auth', authRouter);

app.use('/api', (req, res, next) => {
  if (req.query.token) req.headers.authorization = `Bearer ${req.query.token}`;
  next();
}, authMiddleware, datosRouter);

// Capturar errores del servidor y devolver JSON en vez de HTML
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// Frontend en producción
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(dist));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Finanzas Personales en puerto ${PORT}`));

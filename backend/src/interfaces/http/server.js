const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const productosRoutes = require('./productosRoutes');
const pool = require('../../infrastructure/postgres');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => {
  console.log('Se consultó /api/salud');
  res.json({ mensaje: 'Backend de proyecto-ventas funcionando' });
});

app.get('/api/salud-db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ error: 'Service Unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productosRoutes);

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});

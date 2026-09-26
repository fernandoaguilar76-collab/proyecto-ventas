const express = require('express');
const { autenticar } = require('./autorizacion');
const { consultarCatalogo } = require('../../application/consultarCatalogo');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
  try {
    const productos = await consultarCatalogo(req.usuario);
    console.log('Productos consultados:', productos.length);
    res.json({ productos });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error al consultar productos:', error);
    res.status(500).json({ error: 'No se pudieron consultar los productos' });
  }
});

module.exports = router;

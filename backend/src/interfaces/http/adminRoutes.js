const express = require('express');
const { autenticar, soloSuperAdmin } = require('./autorizacion');
const {
  listarSolicitudes,
  decidirAcceso,
} = require('../../application/gestionarAcceso');

const router = express.Router();

router.use(autenticar, soloSuperAdmin);

router.get('/solicitudes', async (req, res) => {
  try {
    const solicitudes = await listarSolicitudes();
    console.log('Solicitudes pendientes:', solicitudes.length);
    res.json({ solicitudes });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    res.status(500).json({ error: 'No se pudieron consultar las solicitudes' });
  }
});

router.patch('/usuarios/:id/acceso', async (req, res) => {
  try {
    const usuario = await decidirAcceso(req.params.id, req.body);
    console.log('Acceso resuelto:', usuario.email, usuario.estado, usuario.rol);
    res.json({ mensaje: 'Solicitud resuelta', usuario });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error al resolver solicitud:', error);
    res.status(500).json({ error: 'No se pudo resolver la solicitud' });
  }
});

module.exports = router;

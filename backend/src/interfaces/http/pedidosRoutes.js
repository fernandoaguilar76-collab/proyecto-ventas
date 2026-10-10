
const express = require('express');
const { autenticar } = require('./autorizacion');

const pedidosRepository = require(
  '../../infrastructure/pedidosRepository'
);

const { crearCasoDeUsoPedido } = require(
  '../../application/crearPedido'
);

const { crearNodemailerAdapter } = require(
  '../../infrastructure/adapters/nodemailerAdapter'
);

const {
  generarCorreoCliente,
  generarCorreoAdmin,
} = require('../../infrastructure/email/plantillasCorreo');

const router = express.Router();

const emailService = crearNodemailerAdapter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM,
});

const crearPedido = crearCasoDeUsoPedido({
  pedidosRepository,
  emailService,
  generarCorreoCliente,
  generarCorreoAdmin,
  adminEmail: process.env.ADMIN_EMAIL,
});

// Crear pedido con usuario autenticado
router.post('/', autenticar, async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    // El usuario se obtiene del JWT, no del navegador.
    const usuarioId = req.usuario.id;
    const correoCliente = req.usuario.email;

    if (!correoCliente) {
      return res.status(400).json({
        error: 'El usuario no tiene correo registrado',
      });
    }

    const resultado = await crearPedido({
      usuarioId,
      productoId,
      cantidad,
      correoCliente,
    });

    return res.status(201).json({
      mensaje: 'Pedido registrado correctamente',
      ...resultado,
    });
  } catch (error) {
    console.error('Error creando pedido:', error.message);

    if (
      error.message === 'El producto no existe' ||
      error.message === 'La cantidad debe ser un entero positivo' ||
      error.message === 'Faltan datos del pedido'
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'No se pudo registrar el pedido',
    });
  }
});

module.exports = router;

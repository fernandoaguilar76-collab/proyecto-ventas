const express = require('express');
const { registrarUsuario } = require('../../application/registrarUsuario');
const { iniciarSesion } = require('../../application/iniciarSesion');

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const usuario = await registrarUsuario(req.body);
    console.log('Usuario registrado:', usuario.email, usuario.estado);
    res.status(201).json({ mensaje: 'Registro recibido', usuario });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }

    if (['El nombre es obligatorio', 'El correo no es válido',
         'La contraseña debe tener al menos 8 caracteres'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error en registro:', error);
    res.status(500).json({ error: 'No se pudo registrar el usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const resultado = await iniciarSesion(req.body);
    console.log('Inicio de sesión:', resultado.usuario.email);
    res.json(resultado);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error en login:', error);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;

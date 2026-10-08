const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../infrastructure/usuariosRepository');

async function iniciarSesion({ email, password } = {}) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    const error = new Error('Correo y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  const usuario = await usuariosRepository.buscarPorEmail(
    email.trim().toLowerCase()
  );

  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  if (usuario.estado !== 'aprobado' || !usuario.rol) {
    const error = new Error('Tu cuenta aún no tiene acceso aprobado');
    error.status = 403;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET');
  }

  const token = jwt.sign(
    { sub: String(usuario.id) },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
    },
  };
}

module.exports = { iniciarSesion };

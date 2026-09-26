const bcrypt = require('bcrypt');
const { validarRegistro } = require('../domain/usuario');
const usuariosRepository = require('../infrastructure/usuariosRepository');

async function registrarUsuario(datosEntrada) {
  const datos = validarRegistro(datosEntrada);
  const passwordHash = await bcrypt.hash(datos.password, 12);

  return usuariosRepository.crear({
    nombre: datos.nombre,
    email: datos.email,
    passwordHash,
  });
}

module.exports = { registrarUsuario };

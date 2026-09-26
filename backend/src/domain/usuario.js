function validarRegistro({ nombre, email, password }) {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    throw new Error('El nombre es obligatorio');
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('El correo no es válido');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  return {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
}

module.exports = { validarRegistro };

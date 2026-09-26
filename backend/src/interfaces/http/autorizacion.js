const jwt = require('jsonwebtoken');
const usuariosRepository = require('../../infrastructure/usuariosRepository');

async function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || '';

  if (!encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta iniciar sesión' });
  }

  let datos;
  try {
    const token = encabezado.slice(7);
    datos = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }

  try {
    const usuario = await usuariosRepository.buscarPorId(datos.sub);

    if (!usuario || usuario.estado !== 'aprobado') {
      return res.status(403).json({ error: 'Cuenta sin acceso aprobado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error al comprobar acceso:', error);
    res.status(500).json({ error: 'No se pudo comprobar el acceso' });
  }
}

function soloSuperAdmin(req, res, next) {
  if (req.usuario.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Acceso exclusivo del súper admin' });
  }

  next();
}

module.exports = { autenticar, soloSuperAdmin };

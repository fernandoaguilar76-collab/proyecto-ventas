const usuariosRepository = require('../infrastructure/usuariosRepository');

const rolesPermitidos = ['admin', 'productos', 'pedidos'];

async function listarSolicitudes() {
  return usuariosRepository.listarPendientes();
}

async function decidirAcceso(id, { decision, rol } = {}) {
  if (!/^\d+$/.test(String(id))) {
    const error = new Error('ID de usuario no válido');
    error.status = 400;
    throw error;
  }

  if (decision !== 'aprobar' && decision !== 'rechazar') {
    const error = new Error('La decisión debe ser aprobar o rechazar');
    error.status = 400;
    throw error;
  }

  if (decision === 'aprobar' && !rolesPermitidos.includes(rol)) {
    const error = new Error('Selecciona admin, productos o pedidos');
    error.status = 400;
    throw error;
  }

  const estado = decision === 'aprobar' ? 'aprobado' : 'rechazado';
  const rolAsignado = decision === 'aprobar' ? rol : null;
  const usuario = await usuariosRepository.resolverSolicitud(
    id, estado, rolAsignado
  );

  if (!usuario) {
    const error = new Error('No existe una solicitud pendiente con ese ID');
    error.status = 404;
    throw error;
  }

  return usuario;
}

module.exports = { listarSolicitudes, decidirAcceso };

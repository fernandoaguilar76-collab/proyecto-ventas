const productosRepository = require('../infrastructure/productosRepository');

async function consultarCatalogo(usuario) {
  if (!['pedidos', 'super_admin'].includes(usuario.rol)) {
    const error = new Error('Tu rol no puede consultar este catálogo');
    error.status = 403;
    throw error;
  }

  return productosRepository.listarAprobados();
}

module.exports = { consultarCatalogo };

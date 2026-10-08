const pool = require('./postgres');

async function listarAprobados() {
  const resultado = await pool.query(
    `SELECT id, nombre, descripcion, precio, imagen_url
     FROM productos
     WHERE estado = 'aprobado'
     ORDER BY id ASC`
  );

  return resultado.rows;
}

module.exports = { listarAprobados };

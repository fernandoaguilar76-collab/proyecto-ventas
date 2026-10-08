const pool = require('./postgres');

async function crear({ nombre, email, passwordHash }) {
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, rol, estado`,
    [nombre, email, passwordHash]
  );
  return resultado.rows[0];
}

async function buscarPorEmail(email) {
  const resultado = await pool.query(
    `SELECT id, nombre, email, password_hash, rol, estado
     FROM usuarios WHERE email = $1`,
    [email]
  );
  return resultado.rows[0] || null;
}

async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT id, nombre, email, rol, estado
     FROM usuarios WHERE id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function listarPendientes() {
  const resultado = await pool.query(
    `SELECT id, nombre, email, estado, creado_en
     FROM usuarios WHERE estado = 'pendiente'
     ORDER BY creado_en ASC`
  );
  return resultado.rows;
}

async function resolverSolicitud(id, estado, rol) {
  const resultado = await pool.query(
    `UPDATE usuarios SET estado = $2, rol = $3
     WHERE id = $1 AND estado = 'pendiente' AND rol IS NULL
     RETURNING id, nombre, email, rol, estado`,
    [id, estado, rol]
  );
  return resultado.rows[0] || null;
}

module.exports = {
  crear,
  buscarPorEmail,
  buscarPorId,
  listarPendientes,
  resolverSolicitud,
};

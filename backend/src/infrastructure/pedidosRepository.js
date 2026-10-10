
const pool = require('./postgres');

async function crearPedido({
  usuarioId,
  productoId,
  cantidad,
  precioUnitario,
  total,
  correoCliente,
}) {
  const consulta = `
    INSERT INTO pedidos (
      usuario_id,
      producto_id,
      cantidad,
      precio_unitario,
      total,
      correo_cliente,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pendiente_pago')
    RETURNING *
  `;

  const valores = [
    usuarioId,
    productoId,
    cantidad,
    precioUnitario,
    total,
    correoCliente,
  ];

  const resultado = await pool.query(consulta, valores);

  return resultado.rows[0];
}

async function obtenerProductoPorId(productoId) {
const resultado = await pool.query(
  `SELECT id, nombre, descripcion, precio, estado
   FROM productos
   WHERE id = $1 AND estado = 'aprobado'`,
  [productoId]
  );

  return resultado.rows[0] || null;
}

async function actualizarNotificaciones(
  pedidoId,
  notificacionCliente,
  notificacionAdmin
) {
  const resultado = await pool.query(
    `UPDATE pedidos
     SET notificacion_cliente = $2,
         notificacion_admin = $3
     WHERE id = $1
     RETURNING *`,
    [pedidoId, notificacionCliente, notificacionAdmin]
  );

  return resultado.rows[0];
}

module.exports = {
  crearPedido,
  obtenerProductoPorId,
  actualizarNotificaciones,
};

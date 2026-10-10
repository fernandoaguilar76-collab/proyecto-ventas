
/**
 * Caso de uso: Crear pedido.
 *
 * Coordina los puertos de persistencia y correo.
 * No depende de PostgreSQL, Nodemailer ni Express.
 */
function crearCasoDeUsoPedido({
  pedidosRepository,
  emailService,
  generarCorreoCliente,
  generarCorreoAdmin,
  adminEmail,
}) {
  if (!pedidosRepository || !emailService) {
    throw new Error('Faltan dependencias del caso de uso');
  }

  return async function crearPedido({
    usuarioId,
    productoId,
    cantidad,
    correoCliente,
  }) {
    const unidades = Number(cantidad);

    if (!Number.isSafeInteger(unidades) || unidades < 1) {
      throw new Error('La cantidad debe ser un entero positivo');
    }

    if (!usuarioId || !productoId || !correoCliente) {
      throw new Error('Faltan datos del pedido');
    }

    const producto = await pedidosRepository.obtenerProductoPorId(
      productoId
    );

    if (!producto) {
      throw new Error('El producto no existe');
    }

    const precioCentavos = Math.round(
      Number(producto.precio) * 100
    );

    if (!Number.isSafeInteger(precioCentavos) ||
        precioCentavos <= 0) {
      throw new Error('El producto tiene un precio inválido');
    }

    const totalCentavos = precioCentavos * unidades;

    if (!Number.isSafeInteger(totalCentavos)) {
      throw new Error('El total excede el límite permitido');
    }

    const pedido = await pedidosRepository.crearPedido({
      usuarioId,
      productoId,
      cantidad: unidades,
      precioUnitario: (precioCentavos / 100).toFixed(2),
      total: (totalCentavos / 100).toFixed(2),
      correoCliente,
    });

    // El pedido ya está registrado.
    // Si el correo falla, no eliminamos la compra.
    let enviadoCliente = false;
    let enviadoAdmin = false;

    try {
      await emailService.enviarCorreo(
        generarCorreoCliente({ pedido, producto })
      );
      enviadoCliente = true;
    } catch (error) {
      console.error('Error notificando al cliente:', error.message);
    }

// Pausa para respetar el límite de velocidad de Mailtrap Sandbox
// Esperar antes de enviar el correo al administrador
await new Promise(resolve => setTimeout(resolve, 5000));

// Reintentar si Mailtrap rechaza temporalmente el envío
for (let intento = 1; intento <= 3; intento++) {
  try {
    await emailService.enviarCorreo(
      generarCorreoAdmin({
        pedido,
        producto,
        adminEmail,
      })
    );

    enviadoAdmin = true;
    console.log('Correo del administrador enviado correctamente');
    break;

  } catch (error) {
    console.error(
      `Intento ${intento} fallido al notificar al administrador:`,
      error.message
    );

    // No reintentar errores que no sean de límite de velocidad
    const limiteVelocidad =
      error.responseCode === 550 &&
      /too many emails per second/i.test(error.message);

    if (!limiteVelocidad || intento === 3) {
      break;
    }

    // Esperar antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
    await pedidosRepository.actualizarNotificaciones(
      pedido.id,
      enviadoCliente,
      enviadoAdmin
    );

    return {
      pedidoId: pedido.id,
      estado: pedido.estado,
      total: pedido.total,
      notificacionCliente: enviadoCliente,
      notificacionAdmin: enviadoAdmin,
    };
  };
}

module.exports = { crearCasoDeUsoPedido };

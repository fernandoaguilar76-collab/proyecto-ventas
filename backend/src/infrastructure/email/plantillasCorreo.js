
const escaparHTML = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caracter]);

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor));

function generarCorreoCliente({ pedido, producto }) {
  const instrucciones =
    process.env.PAGO_INSTRUCCIONES ||
    'Contacta al administrador para recibir instrucciones de pago.';

  const texto = `
NOVATECH - Confirmación de pedido

Número de pedido: ${pedido.id}
Producto: ${producto.nombre}
Cantidad: ${pedido.cantidad}
Precio unitario: ${formatoMoneda(pedido.precio_unitario)}
Total: ${formatoMoneda(pedido.total)}
Estado: Pendiente de Pago

Instrucciones de pago:
${instrucciones}

Gracias por comprar en NOVATECH.
`.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h1 style="color:#172b4d">NOVATECH</h1>
      <h2>Confirmación de pedido #${escaparHTML(pedido.id)}</h2>
      <p>Hemos registrado tu compra correctamente.</p>

      <table style="width:100%;border-collapse:collapse">
        <tr><td><b>Producto</b></td><td>${escaparHTML(producto.nombre)}</td></tr>
        <tr><td><b>Cantidad</b></td><td>${escaparHTML(pedido.cantidad)}</td></tr>
        <tr><td><b>Precio unitario</b></td><td>${formatoMoneda(pedido.precio_unitario)}</td></tr>
        <tr><td><b>Total</b></td><td><b>${formatoMoneda(pedido.total)}</b></td></tr>
        <tr><td><b>Estado</b></td><td>Pendiente de Pago</td></tr>
      </table>

      <h3>Instrucciones de pago</h3>
      <p>${escaparHTML(instrucciones)}</p>

      <p>Gracias por elegir NOVATECH.</p>
    </div>
  `;

  return {
    para: pedido.correo_cliente,
    asunto: `NOVATECH - Confirmación de pedido #${pedido.id}`,
    texto,
    html,
  };
}

function generarCorreoAdmin({ pedido, producto, adminEmail }) {
  const texto = `
NOVATECH - Nuevo pedido recibido

Pedido: #${pedido.id}
Usuario: ${pedido.usuario_id}
Correo del cliente: ${pedido.correo_cliente}
Producto: ${producto.nombre}
Cantidad: ${pedido.cantidad}
Total: ${formatoMoneda(pedido.total)}
Estado: Pendiente de Pago
`.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h1>NOVATECH - Administración</h1>
      <h2>Nuevo pedido #${escaparHTML(pedido.id)}</h2>
      <p>Se ha registrado una nueva solicitud de compra.</p>
      <p><b>Cliente:</b> ${escaparHTML(pedido.correo_cliente)}</p>
      <p><b>Producto:</b> ${escaparHTML(producto.nombre)}</p>
      <p><b>Cantidad:</b> ${escaparHTML(pedido.cantidad)}</p>
      <p><b>Total:</b> ${formatoMoneda(pedido.total)}</p>
      <p><b>Estado:</b> Pendiente de Pago</p>
      <p>Revisa el pedido desde el panel de administración.</p>
    </div>
  `;

  return {
    para: adminEmail,
    asunto: `NOVATECH - Nuevo pedido #${pedido.id}`,
    texto,
    html,
  };
}

module.exports = {
  generarCorreoCliente,
  generarCorreoAdmin,
};

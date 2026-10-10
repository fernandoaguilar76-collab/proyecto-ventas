
/**
 * Puerto de salida para el servicio de correo.
 *
 * La capa de aplicación depende de este contrato,
 * no de Nodemailer ni de Mailtrap.
 */
function crearEmailServicePort({ enviarCorreo }) {
  if (typeof enviarCorreo !== 'function') {
    throw new Error('El servicio debe implementar enviarCorreo');
  }

  return Object.freeze({
    enviarCorreo,
  });
}

module.exports = { crearEmailServicePort };

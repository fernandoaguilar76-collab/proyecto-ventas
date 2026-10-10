
const nodemailer = require('nodemailer');
const { crearEmailServicePort } = require(
  '../../application/ports/emailServicePort'
);

function crearNodemailerAdapter(config) {
  const {
    host,
    port,
    user,
    password,
    from,
  } = config;

  if (!host || !port || !user || !password || !from) {
    throw new Error('Faltan variables de configuración SMTP');
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass: password,
    },
  });

  return crearEmailServicePort({
    async enviarCorreo({ para, asunto, texto, html }) {
      if (!para || !asunto || !texto) {
        throw new Error('Faltan datos del correo');
      }

      const resultado = await transporter.sendMail({
        from,
        to: para,
        subject: asunto,
        text: texto,
        ...(html ? { html } : {}),
      });

      return {
        messageId: resultado.messageId,
        accepted: resultado.accepted,
      };
    },
  });
}

module.exports = { crearNodemailerAdapter };

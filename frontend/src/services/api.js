const API_URL = '/api';

async function solicitar(ruta, { method = 'GET', body, token } = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error en la solicitud');
  }

  return datos;
}

export const registrar = (datos) =>
  solicitar('/auth/registro', { method: 'POST', body: datos });

export const iniciarSesion = (datos) =>
  solicitar('/auth/login', { method: 'POST', body: datos });

export const obtenerSolicitudes = (token) =>
  solicitar('/admin/solicitudes', { token });

export const decidirAcceso = (token, id, decision, rol) =>
  solicitar(`/admin/usuarios/${id}/acceso`, {
    method: 'PATCH',
    token,
    body: { decision, rol },
  });

export const obtenerProductos = (token) =>
  solicitar('/productos', { token });

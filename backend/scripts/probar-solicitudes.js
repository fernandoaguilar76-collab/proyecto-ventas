async function probarSolicitudes() {
  const login = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@tienda.local',
      password: process.env.CLAVE_ADMIN,
    }),
  });

  const sesion = await login.json();
  if (!login.ok) {
    console.log('No se pudo iniciar sesión:', sesion.error);
    return;
  }

  const respuesta = await fetch(
    'http://localhost:4000/api/admin/solicitudes',
    { headers: { Authorization: `Bearer ${sesion.token}` } }
  );

  const datos = await respuesta.json();
  console.log('Estado HTTP:', respuesta.status);
  console.log('Solicitudes:', datos.solicitudes || datos.error);
}

probarSolicitudes().catch((error) => {
  console.error('Error en la prueba:', error.message);
});

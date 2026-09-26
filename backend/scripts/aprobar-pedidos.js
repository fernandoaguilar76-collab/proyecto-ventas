async function aprobarPedidos() {
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
    'http://localhost:4000/api/admin/usuarios/2/acceso',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sesion.token}`,
      },
      body: JSON.stringify({
        decision: 'aprobar',
        rol: 'pedidos',
      }),
    }
  );

  const datos = await respuesta.json();
  console.log('Estado HTTP:', respuesta.status);
  console.log('Resultado:', datos);
}

aprobarPedidos().catch((error) => {
  console.error('Error en la prueba:', error.message);
});

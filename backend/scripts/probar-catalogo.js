async function probarCatalogo() {
  const login = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'prueba@tienda.local',
      password: process.env.CLAVE_PEDIDOS,
    }),
  });

  const sesion = await login.json();
  if (!login.ok) {
    console.log('Error de login:', sesion.error);
    return;
  }

  const respuesta = await fetch('http://localhost:4000/api/productos', {
    headers: { Authorization: `Bearer ${sesion.token}` },
  });

  const datos = await respuesta.json();
  console.log('Estado HTTP:', respuesta.status);
  console.log('Productos:', datos.productos || datos.error);
}

probarCatalogo().catch((error) => {
  console.error('Error en la prueba:', error.message);
});

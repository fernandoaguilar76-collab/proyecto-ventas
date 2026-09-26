async function probarLoginPedidos() {
  const respuesta = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'prueba@tienda.local',
      password: process.env.CLAVE_PEDIDOS,
    }),
  });

  const datos = await respuesta.json();
  console.log('Estado HTTP:', respuesta.status);
  console.log('Usuario:', datos.usuario || null);
  console.log('Token generado:', Boolean(datos.token));
  if (!respuesta.ok) console.log('Error:', datos.error);
}

probarLoginPedidos().catch((error) => {
  console.error('Error en la prueba:', error.message);
});

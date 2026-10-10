async function probarLogin() {
  const respuesta = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@tienda.local',
      password: process.env.CLAVE_ADMIN,
    }),
  });

  const datos = await respuesta.json();
  console.log('Estado HTTP:', respuesta.status);
  console.log('Usuario:', datos.usuario || null);
  console.log('Token generado:', Boolean(datos.token));

  if (!respuesta.ok) {
    console.log('Error:', datos.error);
    process.exitCode = 1;
  }
}

probarLogin().catch((error) => {
  console.error('Error en la prueba:', error.message);
  process.exitCode = 1;
});

const pool = require('./src/infrastructure/postgres');

async function probarConexion() {
  try {
    const resultado = await pool.query(
      'SELECT current_database() AS base, current_user AS usuario'
    );
    console.log('Conexión correcta a PostgreSQL:', resultado.rows[0]);
  } catch (error) {
    console.error('Error de conexión:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

probarConexion();

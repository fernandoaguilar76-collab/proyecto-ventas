const bcrypt = require('bcrypt');
const pool = require('../src/infrastructure/postgres');

async function crearSuperAdmin() {
  const password = process.env.SUPER_ADMIN_PASSWORD;

  try {
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const hash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, nombre, email, rol, estado`,
      ['Super Admin', 'admin@tienda.local', hash, 'super_admin', 'aprobado']
    );

    if (resultado.rowCount === 0) {
      console.log('El súper admin ya existe: admin@tienda.local');
    } else {
      console.log('Súper admin creado:', resultado.rows[0]);
    }
  } catch (error) {
    console.error('Error al crear súper admin:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

crearSuperAdmin();

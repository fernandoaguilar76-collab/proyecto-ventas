INSERT INTO productos
  (nombre, descripcion, precio, imagen_url, creado_por, estado)
SELECT
  'Laptop para estudio',
  'Laptop para clases, tareas y navegación diaria.',
  12999.00,
  '/productos/laptop-estudio.jpg',
  1,
  'aprobado'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Laptop para estudio'
);

INSERT INTO productos
  (nombre, descripcion, precio, imagen_url, creado_por, estado)
SELECT
  'Laptop gamer',
  'Laptop para videojuegos y trabajo con aplicaciones exigentes.',
  21999.00,
  '/productos/laptop-gamer.jpg',
  1,
  'aprobado'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Laptop gamer'
);

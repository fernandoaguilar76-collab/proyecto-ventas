
-- NOVATECH
-- Migración: pedidos con notificaciones por correo

-- Agregar datos necesarios para el comprobante
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS cantidad INTEGER NOT NULL DEFAULT 1;

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2);

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS total NUMERIC(10,2);

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS correo_cliente VARCHAR(150);

-- Actualizar los estados permitidos
ALTER TABLE pedidos
DROP CONSTRAINT IF EXISTS pedidos_estado_check;

ALTER TABLE pedidos
ADD CONSTRAINT pedidos_estado_check
CHECK (
    estado IN (
        'pendiente',
        'pendiente_pago',
        'aprobado',
        'rechazado'
    )
);

-- Los nuevos pedidos quedarán pendientes de pago
ALTER TABLE pedidos
ALTER COLUMN estado SET DEFAULT 'pendiente_pago';

-- Registrar el resultado de las notificaciones
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS notificacion_cliente BOOLEAN
NOT NULL DEFAULT FALSE;

ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS notificacion_admin BOOLEAN
NOT NULL DEFAULT FALSE;

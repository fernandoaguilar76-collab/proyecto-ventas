#!/bin/bash
set -e

echo "======================================"
echo " Despliegue del Backend - Ventas"
echo "======================================"

if [ -z "$1" ]; then
    echo "ERROR: Debes proporcionar la IP privada de PostgreSQL como parámetro."
    echo "Uso: ./deploy-back.sh <IP_DB>"
    exit 1
fi
IP_DB=$1

# Validar contraseñas
if [ -z "$DB_PASSWORD" ] || [ -z "$SUPER_ADMIN_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
    echo "ERROR: Faltan variables de entorno (DB_PASSWORD, SUPER_ADMIN_PASSWORD, JWT_SECRET)."
    exit 1
fi

echo "1. Instalando dependencias (Node.js y PM2)..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Instalar cliente de PostgreSQL para ejecutar migraciones
if ! command -v psql &> /dev/null; then
    sudo apt-get install -y postgresql-client
fi

echo "2. Creando archivo .env..."
cat <<EOF > .env
DB_HOST=$IP_DB
DB_PORT=5432
DB_NAME=ventas_taller3
DB_USER=ventas_app
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
SUPER_ADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD
EOF
chmod 600 .env

echo "3. Ejecutando migraciones SQL e inicialización..."
export PGPASSWORD=$DB_PASSWORD
# Usamos el cliente psql para ejecutar los SQL desde webbackend hacia PostgreSQL
psql -h $IP_DB -U ventas_app -d ventas_taller3 -f sql/001_tablas.sql
# Ejecutamos el script de Node para crear el admin (depende de .env que acabamos de crear)
node scripts/crear-super-admin.js
# Ahora insertamos los productos
psql -h $IP_DB -U ventas_app -d ventas_taller3 -f sql/002_productos_ejemplo.sql

echo "4. Instalando dependencias del bundle..."
npm install --omit=dev

echo "5. Iniciando PM2..."
pm2 restart ventas-backend || pm2 start dist/server.js --name ventas-backend --cwd "$(pwd)"
pm2 save

echo "6. Probando endpoint de salud..."
sleep 2
curl -s http://localhost:4000/api/salud-db | grep -q "ok" && echo "Backend conectado a DB exitosamente!" || echo "ADVERTENCIA: Falló el endpoint de salud."

echo "======================================"
echo " Despliegue de Backend terminado."
echo "======================================"

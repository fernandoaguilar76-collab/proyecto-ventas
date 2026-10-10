#!/bin/bash
set -e

echo "======================================"
echo " Despliegue de Base de Datos - Ventas"
echo "======================================"

# Validar contraseñas
if [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: La variable de entorno DB_PASSWORD no está definida."
    exit 1
fi

echo "1. Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
else
    echo "PostgreSQL ya está instalado."
fi

# Detectar versión automáticamente
PG_VERSION=$(ls /etc/postgresql/ | head -n 1)
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
echo "Versión de PostgreSQL detectada: $PG_VERSION"

echo "2. Configurando red de PostgreSQL..."
if ! sudo grep -q "^listen_addresses = '\*'" "$PG_CONF"; then
    echo "listen_addresses = '*'" | sudo tee -a "$PG_CONF" > /dev/null
    echo "listen_addresses modificado."
fi

if ! sudo grep -q "0.0.0.0/0.*md5\|0.0.0.0/0.*scram-sha-256" "$PG_HBA"; then
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_HBA" > /dev/null
    echo "Regla de acceso añadida a pg_hba.conf."
fi

sudo systemctl restart postgresql

echo "3. Configurando Base de Datos y Usuario..."
DB_NAME="ventas_taller3"
DB_USER="ventas_app"

sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "======================================"
echo " Configuración de base de datos terminada."
echo "======================================"

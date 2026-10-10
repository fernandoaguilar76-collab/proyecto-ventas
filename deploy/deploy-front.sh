#!/bin/bash
set -e

echo "======================================"
echo " Despliegue del Frontend - Ventas"
echo "======================================"

if [ -z "$1" ]; then
    echo "ERROR: Debes proporcionar la IP privada del Backend como parámetro."
    echo "Uso: ./deploy-front.sh <IP_BACKEND>"
    exit 1
fi
IP_BACKEND=$1

echo "1. Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt update
    sudo apt install -y nginx
fi

echo "2. Desplegando archivos estáticos..."
sudo rm -rf /var/www/app
sudo mkdir -p /var/www/app
sudo cp -r dist/* /var/www/app/
sudo chown -R www-data:www-data /var/www/app

echo "3. Configurando Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/default > /dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/app;
    index index.html;

    server_name _;
    client_max_body_size 10M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://$IP_BACKEND:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo "4. Validando y reiniciando Nginx..."
sudo nginx -t
sudo systemctl restart nginx

echo "5. Comprobando que responda a peticiones web locales..."
curl -s http://localhost | grep -q "NOVA" || echo "Nota: Verifica si index.html se sirvió correctamente."

echo "======================================"
echo " Despliegue de Frontend terminado."
echo "======================================"

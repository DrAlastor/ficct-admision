FROM php:8.4-cli

# Instalar dependencias del sistema y PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    zip \
    unzip

# Instalar Node.js (necesario para compilar React con Vite)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalar la extensión PDO para PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Obtener Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el código del proyecto
COPY . /app

# Instalar dependencias de PHP y Node, y compilar el frontend
RUN composer install --optimize-autoloader --no-dev
RUN npm install
RUN npm run build

# Comando para iniciar Laravel usando el puerto que asigne Render
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}

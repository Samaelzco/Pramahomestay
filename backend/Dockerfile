FROM php:8.3-cli-bookworm AS development

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        curl \
        git \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        pcntl \
        pdo_pgsql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-autoloader \
    --no-interaction \
    --no-scripts \
    --prefer-dist

COPY . .

RUN composer install \
    --no-interaction \
    --optimize-autoloader \
    --prefer-dist

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

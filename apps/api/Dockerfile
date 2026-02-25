FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
  git unzip libzip-dev libpng-dev libonig-dev libicu-dev \
  && docker-php-ext-install pdo_mysql zip intl \
  && a2enmod rewrite

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# untuk dev: mount volume akan menimpa isi, jadi tidak perlu COPY source di sini
RUN chown -R www-data:www-data /var/www/html
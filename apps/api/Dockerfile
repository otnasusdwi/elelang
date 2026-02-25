FROM php:8.3-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update && apt-get install -y \
  git unzip libzip-dev libpng-dev libonig-dev libicu-dev \
  && docker-php-ext-install pdo_mysql zip intl pcntl \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
  && sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
  && a2enmod rewrite

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# untuk dev: mount volume akan menimpa isi, jadi tidak perlu COPY source di sini
RUN chown -R www-data:www-data /var/www/html

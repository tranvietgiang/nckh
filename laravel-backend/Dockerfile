FROM php:8.2-apache

WORKDIR /var/www/html

# ------------------------------------------------------------
# Cài extension cần thiết cho Laravel & Google Drive API
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        zip \
        gd \
        bcmath \
        opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------
# Bật mod_rewrite để Laravel route hoạt động
# ------------------------------------------------------------
RUN a2enmod rewrite

# ------------------------------------------------------------
# Chỉnh DocumentRoot về thư mục public/
# ------------------------------------------------------------
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' \
    /etc/apache2/sites-available/000-default.conf

# ------------------------------------------------------------
# Copy code Laravel vào container
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# Quyền truy cập Laravel
# ------------------------------------------------------------
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/public \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ------------------------------------------------------------
#  Tăng giới hạn upload cho PHP (200MB)
# ------------------------------------------------------------
RUN echo "upload_max_filesize=200M" > /usr/local/etc/php/conf.d/uploads.ini \
 && echo "post_max_size=200M" >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "max_input_time=300" >> /usr/local/etc/php/conf.d/uploads.ini

# ------------------------------------------------------------
# Mở cổng Apache
# ------------------------------------------------------------
EXPOSE 80

CMD ["apache2-foreground"]

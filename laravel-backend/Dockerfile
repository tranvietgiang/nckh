# FROM php:8.2-apache

# WORKDIR /var/www/html

# # Copy code vào container
# COPY . .

# # Bật mod_rewrite
# RUN a2enmod rewrite

# # Cài PDO MySQL (bắt buộc để Laravel connect MySQL)
# RUN apt-get update && apt-get install -y libonig-dev libzip-dev unzip \
#     && docker-php-ext-install pdo_mysql \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Chỉnh DocumentRoot về public
# RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# # Quyền Laravel
# RUN chown -R www-data:www-data /var/www/html \
#     && chmod -R 755 /var/www/html/public \
#     && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# EXPOSE 80
# CMD ["apache2-foreground"]

FROM php:8.2-apache

WORKDIR /var/www/html

# Copy code vào container
COPY . .

# Bật mod_rewrite
RUN a2enmod rewrite

# Cài PDO MySQL (bắt buộc để Laravel connect MySQL)
RUN apt-get update && apt-get install -y libonig-dev libzip-dev unzip \
    && docker-php-ext-install pdo_mysql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Chỉnh DocumentRoot về public
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Quyền Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/public \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ⚙️ Thêm giới hạn upload
RUN echo "upload_max_filesize=50M" > /usr/local/etc/php/conf.d/uploads.ini \
 && echo "post_max_size=50M" >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/uploads.ini

EXPOSE 80
CMD ["apache2-foreground"]

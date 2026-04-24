# Use the official PHP with Apache image
FROM php:8.2-apache

# Install dependencies needed for MongoDB extension and Composer
RUN apt-get update && apt-get install -y \
    libssl-dev \
    pkg-config \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install the MongoDB extension using PECL and enable it
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache URL rewriting
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy the entire project into the Apache server directory
COPY . /var/www/html/

# Run composer install to download the correct MongoDB dependencies natively
ENV COMPOSER_MEMORY_LIMIT=-1
RUN cd backend && composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Give Apache permissions
RUN chown -R www-data:www-data /var/www/html

# When Railway starts the container, it provides a random $PORT.
# We replace Apache's default port 80 with this new $PORT before starting the server.
CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && docker-php-entrypoint apache2-foreground

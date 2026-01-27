# Stage 1: Use Nginx to serve the static files
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy the project files to the Nginx public directory
COPY index.html .
COPY style.css .
COPY script.js .

# Copy custom Nginx configuration (optional - for better default settings)
RUN echo "server { \
    listen 80; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        try_files \$uri \$uri/ /index.html; \
        add_header Cache-Control 'public, max-age=3600'; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

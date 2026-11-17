# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx ng build --configuration production

# ---------- runtime ----------
FROM nginx:1.29-alpine
# Nginx sem root: porta 8080, diretórios graváveis pelo usuário nginx.
RUN sed -i 's/^user .*;//' /etc/nginx/nginx.conf \
    && sed -i 's#pid .*;#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf \
    && mkdir -p /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /usr/share/nginx/html
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build --chown=nginx:nginx /build/dist/jmc-ai-analyzer-web/browser /usr/share/nginx/html
ENV API_UPSTREAM=http://api:8080 \
    POLLING_INTERVAL_MS=2000 \
    NGINX_ENVSUBST_FILTER=API_UPSTREAM
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

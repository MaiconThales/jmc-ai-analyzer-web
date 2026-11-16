FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginxinc/nginx-unprivileged:alpine

USER root
# 1. Remove a página padrão "Welcome to nginx!"
RUN rm -rf /usr/share/nginx/html/*

# 2. Copia os arquivos compilados do Angular
COPY --from=build --chown=101:101 /app/dist/jmc-ai-analyzer-web/browser /usr/share/nginx/html

# 3. Se o Angular gerou index.csr.html em vez de index.html, renomeia para index.html
RUN if [ -f /usr/share/nginx/html/index.csr.html ] && [ ! -f /usr/share/nginx/html/index.html ]; then \
      mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

USER 101:101
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

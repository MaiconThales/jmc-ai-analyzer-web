---
tags: [jmc-ai-analyzer, web, v0-1-0, docker, qualidade]
versao: 0.1.0
status: rascunho
---

# Infraestrutura e qualidade

Voltar: [[00 Índice]]

## Docker

### Imagem — `Dockerfile` em multi-stage

1. **build**: `node:24-alpine`, com `npm ci` e `npm run build` (configuração `production`).
2. **runtime**: `nginx:alpine`, usuário não-root, `HEALTHCHECK` em `/healthz` e configuração em `docker/nginx.conf`.

### Nginx

- Serve `dist/` com fallback para `index.html` (rotas do Angular).
- `location /api/` e `location = /actuator/health` fazem proxy para `${API_UPSTREAM}` (padrão `http://api:8080`).
- `client_max_body_size 1g` e `proxy_request_buffering off` (o upload vai direto para a API).
- `proxy_read_timeout 300s`.
- Cache longo para os arquivos com hash; `no-cache` para `index.html`.
- Cabeçalhos: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`.
- `/runtime-config.json` gerado na inicialização a partir das variáveis do container: só o intervalo de polling. Os limites de upload vêm da API (`GET /api/v1/config`).

### Compose

O front entra no `docker-compose.yml` **do repositório da API**, no bloco `frontend` hoje comentado:

```yaml
frontend:
  image: jmc-ai-analyzer-web:0.1.0
  build: ../jmc-ai-analyzer-web            # ou imagem publicada
  depends_on:
    api:
      condition: service_healthy
  ports:
    - "${FRONTEND_PORT:-4200}:8080"
  environment:
    API_UPSTREAM: http://api:8080
    POLLING_INTERVAL_MS: ${FRONTEND_POLLING_INTERVAL_MS:-2000}
  volumes:
    - ${DATA_DIR:-./docker-data}/frontend/logs:/var/log/nginx
```

- Os limites de upload não são duplicados: o front lê de `GET /api/v1/config`.
- Logs do Nginx no host, conforme a regra de persistência da API. O front não tem outro estado.

## Testes

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Pipes, utilitários, mensagens de erro | Vitest | formatação de bytes, durações, frações; mapa `code` → mensagem |
| Stores | Vitest + `HttpTestingController` | carregamento, erro, polling (com fake timers), progresso de upload |
| Componentes | Vitest + Angular Testing Library | cartões de diagnóstico, cobertura, blocos com `available: false`, formulários |
| Gráficos | Vitest | montagem das opções do ECharts (sem renderizar o canvas) |
| Contrato | script + Vitest | tipos gerados iguais ao OpenAPI atual da API |
| E2E | Playwright contra o Compose | CA-W01 a CA-W09 com os 3 `.jfr` de exemplo da API |
| Acessibilidade | `@axe-core/playwright` | CA-W12 nas 6 telas |

- Os dados dos testes de componente usam **respostas reais** gravadas da API (fixtures JSON geradas a partir dos `.jfr` de exemplo).
- E2E: o script `e2e:up` sobe o Compose da API com o front e roda o Playwright.

## Cobertura

- Vitest com `coverage.provider: 'v8'` e limites de **90%** em linhas e branches (`thresholds`); `npm run test:ci` falha abaixo disso.
- Exclusões: `main.ts`, `app.config.ts`, `*.routes.ts`, `core/api/generated/**`.

## Sonar

- `sonar-project.properties` com `sonar.javascript.lcov.reportPaths=coverage/lcov.info` e as mesmas exclusões.
- Mesmo SonarQube da API, rodado localmente:
  ```bash
  npx sonar-scanner -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.token=$SONAR_TOKEN
  ```
- ESLint (`angular-eslint`) com `strict` e regras que antecipam o Sonar: sem `any`, sem `console`, complexidade cognitiva ≤ 15.

## Scripts (`package.json`)

| Script | Faz |
|---|---|
| `start` | `ng serve` com `proxy.conf.json` |
| `build` | build de produção |
| `test` / `test:ci` | Vitest (watch / com cobertura e limites) |
| `lint` | ESLint |
| `api:types` | gera `api.d.ts` a partir da API |
| `e2e` | Playwright |
| `verify` | `lint` + `test:ci` + contrato + `build` |

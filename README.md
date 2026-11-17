# JMC AI Analyzer Web

Front-end Angular da [JMC AI Analyzer API](../jmc-ai-analyzer-api). Envia gravações `.jfr` e mostra, de relance, **o que arrumar**: diagnóstico priorizado, o trecho do seu código e a ação, seguidos das métricas que sustentam cada item.

- Especificação, plano e tarefas: [`.spec/0.1.0/`](.spec/0.1.0/)
- Documentação de produto e identidade visual (Obsidian): [`jmc-ai-analyzer-web/v0.1.0/`](jmc-ai-analyzer-web/v0.1.0/)

## Stack

Angular 22 (standalone, signals, zoneless) · Angular Material 22 · ngx-echarts + ECharts 6 · Vitest · Playwright · Nginx.

## Rodar com a pilha completa (Docker)

O front entra no `docker-compose.yml` do repositório da API (serviço `frontend`), que espera este repositório em `../jmc-ai-analyzer-web`:

```bash
cd ../jmc-ai-analyzer-api
cp .env.example .env   # se ainda não existir; troque os "change-me"
docker compose up -d --build
```

Abra http://localhost:4200. O Nginx do front repassa `/api` para a API (mesma origem, sem CORS).

## Desenvolvimento

Com a API rodando em `http://localhost:8080`:

```bash
npm ci
npm start
```

O `ng serve` usa o `proxy.conf.json` para `/api` e `/actuator`.

| Script | Faz |
|---|---|
| `npm start` | servidor de desenvolvimento com proxy |
| `npm test` / `npm run test:ci` | testes unitários (Vitest) / com cobertura e limite de 90% |
| `npm run lint` | ESLint com as regras do Sonar |
| `npm run build` | build de produção (orçamento: 500 kB no carregamento inicial) |
| `npm run verify` | lint + testes com cobertura + build |
| `npm run api:types` | regenera `src/app/core/api/generated/api.d.ts` a partir do OpenAPI da API (`API_URL`, padrão `http://localhost:8080`) |
| `npm run api:check` | falha se os tipos gerados estiverem desatualizados |
| `npm run e2e:up` | sobe a pilha completa pelo Compose da API |
| `npm run e2e` | testes E2E e de acessibilidade (Playwright + axe) contra `E2E_BASE_URL` (padrão `http://localhost:4200`) |

Os E2E usam o Chrome instalado (`E2E_CHANNEL=chrome`) e os `.jfr` de `../jmc-ai-analyzer-api/examples files` (`E2E_JFR_DIR`).

## SonarQube

```bash
npm run test:ci
npx sonar-scanner -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.token=$SONAR_TOKEN
```

## Estrutura

```text
src/app/
├── core/       clientes da API (tipos gerados), erros, configuração, tema, saúde da API
├── shared/     formatação, componentes visuais, gráficos (ECharts), estado remoto
└── features/   upload, batch-status, dashboard (blocos), recording-dashboard, batch-dashboard,
                history, software, not-found
```

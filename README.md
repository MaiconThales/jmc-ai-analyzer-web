# JMC AI Analyzer — Web

> As telas do JMC AI Analyzer: envie gravações **JFR** e veja, de relance, **o que arrumar** na sua aplicação Java, onde está no seu código e como resolver.

Este repositório é o **front-end** (Angular). Ele conversa com a API em [jmc-ai-analyzer-api](https://github.com/MaiconThales/jmc-ai-analyzer-api), que é de onde **tudo sobe junto, com um único comando**. Se você só quer usar a aplicação, siga o [passo a passo](#passo-a-passo-para-rodar).

---

## Sumário

- [O que é](#o-que-é)
- [O que faz](#o-que-faz)
- [Passo a passo para rodar](#passo-a-passo-para-rodar)
- [Problemas comuns](#problemas-comuns)
- [Desenvolvimento (só o front)](#desenvolvimento-só-o-front)
- [Estrutura do código](#estrutura-do-código)

---

## O que é

Gravações `.jfr` (Java Flight Recorder) guardam tudo o que aconteceu dentro de uma aplicação Java: CPU, memória, coletas de lixo, threads, travas, exceções… O Java Mission Control mostra esses dados, mas em inglês, espalhados e sem dizer o que fazer.

Este front pega o diagnóstico da API e apresenta como um **laudo**:

- uma **nota de saúde** (0 a 100);
- os problemas em **cartões priorizados** (ALTA, MÉDIA, BAIXA), cada um com a evidência, o **local no seu código** e a ação **"Como arrumar"**;
- os gráficos e tabelas que sustentam cada item, um clique abaixo.

## O que faz

| Tela | O que você faz nela |
|---|---|
| **Upload** | arrasta ou escolhe os `.jfr` (até 20, de até 128 MB cada), informa o software, a versão e o ambiente, e envia. Arquivos inválidos são barrados antes do envio. |
| **Status do lote** | acompanha o processamento ao vivo, com barra de progresso, sem recarregar a página. |
| **Dashboard do lote** | vê o resumo (saúde e problemas por prioridade), o que arrumar "em N de M gravações", o comparativo entre as gravações e as métricas de todas juntas. |
| **Dashboard da gravação** | mesma visão para uma única gravação, com os metadados da JVM. |
| **Histórico** | lista as análises já feitas, com filtro por software e paginação. |
| **Softwares** | ajusta a retenção (dias) e os **pacotes do seu código**, que fazem o diagnóstico apontar as linhas da *sua* aplicação. |

Também:

- **tema claro e escuro** (segue o sistema ou a sua escolha);
- funciona no **computador, tablet e celular**: os menus ficam fixos e só o conteúdo rola;
- é **acessível** (teclado, leitor de tela, contraste AA) e respeita quem pede menos animação.

---

## Passo a passo para rodar

O front **não sobe sozinho**: ele é um dos serviços do `docker-compose.yml` do repositório da API. Você só precisa de **Git** e **Docker**.

### 1. Instale os pré-requisitos

| Ferramenta | Como conferir |
|---|---|
| Git | `git --version` |
| Docker com Compose v2 (Docker Desktop no Windows/macOS, Docker Engine 24+ no Linux) | `docker compose version` |

Deixe pelo menos **6 GB de memória** para o Docker (Docker Desktop: *Settings → Resources → Memory*) e as portas **4200** e **8080** livres.

### 2. Baixe os dois projetos lado a lado

Os dois precisam ficar **na mesma pasta, com estes nomes exatos**:

```text
qualquer-pasta/
├── jmc-ai-analyzer-api/   ← é daqui que você sobe tudo
└── jmc-ai-analyzer-web/   ← este repositório
```

```bash
mkdir jmc-ai-analyzer
cd jmc-ai-analyzer
git clone -b refactore https://github.com/MaiconThales/jmc-ai-analyzer-api.git
git clone -b refactore https://github.com/MaiconThales/jmc-ai-analyzer-web.git
```

> [!IMPORTANT]
> A versão atual está na branch **`refactore`** dos dois repositórios. A `main` ainda tem uma versão antiga.

> [!NOTE]
> **Baixou como ZIP?** Renomeie as pastas para `jmc-ai-analyzer-api` e `jmc-ai-analyzer-web` (o ZIP do GitHub coloca o nome da branch no final).

### 3. Configure o `.env` (na pasta da API)

```bash
cd jmc-ai-analyzer-api
cp .env.example .env
```

No Windows (PowerShell): `Copy-Item .env.example .env`

Abra o `.env` e troque os três `change-me` (`POSTGRES_PASSWORD`, `BLOB_ACCESS_KEY` e `BLOB_SECRET_KEY`). Nas chaves do blob use **só letras, números, `-` e `_`**. Os detalhes de cada variável estão no [README da API](https://github.com/MaiconThales/jmc-ai-analyzer-api#3-crie-o-arquivo-de-configuração-env).

### 4. Suba tudo

Ainda em `jmc-ai-analyzer-api`:

```bash
docker compose up -d --build
```

A primeira vez demora de 5 a 15 minutos (o Docker baixa imagens e compila a API e o front). Acompanhe com:

```bash
docker compose ps
```

Quando `api` e `frontend` estiverem **`healthy`**, abra **http://localhost:4200**.

### 5. Primeira análise

1. Na tela **Upload**, escolha os arquivos de `jmc-ai-analyzer-api/examples files/`.
2. Digite um nome em **Software** (ex.: `meu-servico`) e clique em **Enviar**.
3. Espere o status terminar e clique em **Ver dashboard do lote**.

Para parar: `docker compose stop` (os dados continuam guardados). Para atualizar depois de um `git pull` nos dois repositórios: `docker compose up -d --build`.

---

## Problemas comuns

| Sintoma | Como resolver |
|---|---|
| `path "../jmc-ai-analyzer-web" not found` ao subir | as pastas não estão lado a lado ou têm outro nome; veja o [passo 2](#2-baixe-os-dois-projetos-lado-a-lado) (ou ajuste `FRONTEND_CONTEXT` no `.env` da API) |
| a tela mostra **"A API está fora do ar"** | a API ainda está subindo ou caiu: confira com `docker compose ps` e `docker compose logs api` |
| a tela abre sem estilo ou com a versão antiga | recarregue com `Ctrl+Shift+R` (`Cmd+Shift+R` no macOS) |
| `port is already allocated` na 4200 | troque `FRONTEND_PORT` no `.env` da API e acesse a nova porta |
| `frontend` reiniciando sem parar, com `40-runtime-config.sh: not found` nos logs | quebra de linha do Windows (CRLF) numa versão antiga do front: rode `git pull` neste repositório e `docker compose up -d --build` na pasta da API (a imagem atual remove o CRLF sozinha) |

Outros problemas (memória, banco, blob): veja [Problemas comuns no README da API](https://github.com/MaiconThales/jmc-ai-analyzer-api#problemas-comuns).

---

## Desenvolvimento (só o front)

Para mexer nas telas com recarga automática, rodando o Angular fora do Docker.

**Requisitos**: Node.js **24** (LTS) com npm, e a API rodando em `http://localhost:8080` (suba a pilha da API como no passo a passo; pode até deixar o container `frontend` parado com `docker compose stop frontend`).

```bash
cd jmc-ai-analyzer-web
npm ci          # instala as dependências (só na primeira vez ou quando o package-lock mudar)
npm start       # abre em http://localhost:4200 e recarrega a cada alteração
```

O `ng serve` repassa `/api` e `/actuator` para `http://localhost:8080` (`proxy.conf.json`), então não há problema de CORS.

| Script | Faz |
|---|---|
| `npm start` | servidor de desenvolvimento com proxy para a API |
| `npm test` / `npm run test:ci` | testes unitários (Vitest) / com cobertura e limite de 90% |
| `npm run lint` | ESLint com as regras do Sonar |
| `npm run build` | build de produção (orçamento: 500 kB no carregamento inicial) |
| `npm run verify` | lint + testes com cobertura + build |
| `npm run api:types` | regenera `src/app/core/api/generated/api.d.ts` a partir do OpenAPI da API (`API_URL`, padrão `http://localhost:8080`) |
| `npm run api:check` | falha se os tipos gerados estiverem desatualizados |
| `npm run e2e:up` | sobe a pilha completa pelo Compose da API |
| `npm run e2e` | testes E2E e de acessibilidade (Playwright + axe) contra `E2E_BASE_URL` (padrão `http://localhost:4200`) |

- Os E2E usam o Chrome instalado (`E2E_CHANNEL=chrome`) e os `.jfr` de `../jmc-ai-analyzer-api/examples files` (`E2E_JFR_DIR`). Eles **enviam arquivos de verdade**, então criam análises novas no histórico.
- SonarQube: `npm run test:ci` e depois `npx sonar-scanner -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.token=$SONAR_TOKEN`.

**Stack**: Angular 22 (standalone, signals, zoneless) · Angular Material 22 · ngx-echarts + ECharts 6 · Vitest · Playwright · Nginx (imagem Docker).

**Documentação**:

- especificação, plano e tarefas: [`.spec/0.1.0/`](.spec/0.1.0/);
- produto e identidade visual (Obsidian): [`jmc-ai-analyzer-web/v0.1.0/`](jmc-ai-analyzer-web/v0.1.0/).

## Estrutura do código

```text
src/app/
├── core/       clientes da API (tipos gerados), erros, configuração, tema, layout (saúde da API, rolagem do conteúdo)
├── shared/     formatação, componentes visuais (ícones, selos, chips, estados), gráficos (ECharts), estado remoto
└── features/   upload, batch-status, dashboard (blocos), recording-dashboard, batch-dashboard,
                history, software, not-found
```

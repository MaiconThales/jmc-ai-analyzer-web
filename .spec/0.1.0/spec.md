# Spec — JMC AI Analyzer Web v0.1.0

| Campo | Valor |
|---|---|
| Versão | 0.1.0 |
| Data | 2026-11-17 |
| Status | Aprovada para implementação |
| Fonte | Notas Obsidian em `jmc-ai-analyzer-web/v0.1.0/` (00 a 09) |
| Contrato da API | `jmc-ai-analyzer-api/.spec/0.1.0/spec.md` (§4 e §6) e `GET /v3/api-docs` |
| Plano técnico | [plan.md](plan.md) |
| Tarefas | [tasks.md](tasks.md) |

> Esta spec descreve **o que** o front faz e **como saber que está pronto**. O **como** está em `plan.md`.
> Em caso de dúvida durante a implementação, **perguntar ao autor** antes de decidir.

---

## 1. Objetivo

Front-end Angular da JMC AI Analyzer API. Ele permite enviar um ou vários `.jfr` e, para cada lote e cada gravação, mostra **de relance o que precisa ser arrumado**: o diagnóstico priorizado, o local no código (`appFrame`) e a ação, seguidos da cobertura da gravação e das métricas que sustentam cada item.

**Princípio**: o dashboard responde primeiro "o que eu faço?" e só depois "quais são os números?". Cada item do diagnóstico leva ao bloco de dados que o justifica.

## 2. Escopo

### 2.1. Incluído

- Telas: **Upload**, **Status do lote**, **Dashboard do lote**, **Dashboard da gravação**, **Histórico** e **Softwares**.
- Interface em pt-BR, temas claro e escuro, identidade visual "diagnóstico clínico" (§7).
- Integração com todos os endpoints da API v0.1.0, inclusive `GET /api/v1/config`.
- Erros `problem+json` traduzidos por `code`.
- Polling do status do lote.
- Gráficos de séries, rankings, tabelas e selo de saúde.
- Imagem Docker (Nginx) no Compose da API.

### 2.2. Fora do escopo

- Autenticação e autorização.
- Telas de `ia` e `mcp`.
- Tendência entre lotes e exportar relatório (API v0.2.0).
- Excluir lotes e reprocessar gravações (não há endpoint).
- Idiomas além do pt-BR.
- Pipeline de CI.

## 3. Rotas

| Rota | Tela | Parâmetros |
|---|---|---|
| `/` | redireciona para `/upload` | — |
| `/upload` | Upload | — |
| `/batches/:batchId` | Status do lote | — |
| `/batches/:batchId/dashboard` | Dashboard do lote | `?topN=10\|20\|50` |
| `/recordings/:recordingId` | Dashboard da gravação | `?topN=`, `#<bloco>` |
| `/history` | Histórico | `?software=&page=&size=` |
| `/software` | Softwares | — |
| `**` | Não encontrado | — |

Filtros e opções ficam na query string: um link copiado reabre a mesma visão.

## 4. Requisitos funcionais

### RF-W01 — Upload

- Seleção de arquivos por arrastar e soltar ou pelo seletor.
- Campos:
  - **software** (obrigatório): autocomplete com `GET /api/v1/software`; aceita nome novo; validação `^[a-z0-9][a-z0-9-]{1,63}$` com ajuda visual;
  - **versão** (até 64 caracteres, opcional);
  - **ambiente** (`PROD`, `HML`, `DEV`, `LOCAL`; opcional);
  - **descrição** (até 500 caracteres, com contador).
- Validação local com os limites de `GET /api/v1/config`: extensão (`allowedExtension`), quantidade (`maxFiles`), tamanho por arquivo (`maxFileSizeBytes`) e total (`maxRequestSizeBytes`). Arquivos inválidos ficam marcados na lista e bloqueiam o envio.
- Envio com **barra de progresso** e botão **cancelar**.
- `202` → navega para `/batches/:batchId`.
- Erros da API exibidos junto ao campo ou arquivo, em pt-BR (§6).

### RF-W02 — Status do lote

- Cabeçalho com software, versão, ambiente, descrição e estado do lote.
- Tabela de gravações: nome, tamanho, estado, início, fim, erro traduzido.
- Polling de `GET /api/v1/analyses/{batchId}` a cada `pollingIntervalMs` (padrão 2 s) até o lote sair de `PROCESSING`. Pausa com a aba oculta, para ao sair da rota e, após 3 falhas de rede seguidas, mostra "tentar de novo".
- Gravação `COMPLETED` → link para o dashboard dela. Lote finalizado com ao menos uma `COMPLETED` → botão "Dashboard do lote".

### RF-W03 — Dashboard da gravação

Blocos, nesta ordem:

1. **Cabeçalho**: arquivo, software, versão, JVM, duração, **selo de saúde** e seletor de `topN` (10, 20, 50; máximo vindo de `dashboard.maxTopN`).
2. **Diagnóstico ("O que arrumar")**: cartões na ordem da API. Cada um mostra:
   - chip de prioridade (ícone + texto) e categoria;
   - título e evidência;
   - **local**: `appFrame` em destaque ("seu código"), pilha recolhível, thread ou alvo;
   - **ação**;
   - link "ver dados" que rola até o bloco `domainRef`.
   O cabeçalho do bloco mostra a contagem por prioridade.
3. **Cobertura da gravação**: domínio, estado (`OK`, `INSUFICIENTE`, `AUSENTE`), motivo, recomendação e **comando sugerido** com botão de copiar.
4. **Blocos por domínio**: CPU, heap, GC, threads, locks, hot methods, alocação, exceções, I/O, suspeitos de vazamento e CPU por thread. Cada um tem resumo em texto e a visualização da §7.2. Com `available: false`, aparece recolhido com "sem dados nesta gravação" e link para a cobertura.
5. **Achados do JMC**: lista recolhível com severidade, score, resumo, explicação e solução. O HTML passa pelo sanitizador do Angular.
6. **Metadados**: JVM, argumentos, SO, núcleos e memória.

- `404` → página "não encontrado". `409 NOT_READY` → estado atual e erro da gravação, com link para o status do lote.
- Mudar o `topN` refaz a consulta e atualiza a URL.

### RF-W04 — Dashboard do lote

- Mesmos blocos do RF-W03, alimentados por `GET /api/v1/analyses/{batchId}/dashboard`.
- Diagnóstico e achados mostram "em N de M gravações", com links para cada `recordingId`.
- Séries com uma linha por gravação (legenda com o nome do arquivo).
- **Comparativo**: tabela com duração, CPU média, pausa máxima de GC, selo de saúde e itens `ALTA` por gravação, com link para cada uma.
- Aviso no topo listando as gravações excluídas (`excludedRecordings`).
- Selo de saúde do lote = `healthScore` da API (a pior nota).

### RF-W05 — Histórico

- Tabela de `GET /api/v1/analyses`: data, software, versão, ambiente, descrição, arquivos, estado, selo de saúde, itens `ALTA`, achados `WARNING`.
- Filtro por software (lista de `GET /api/v1/software`) e tamanho de página 20, 50 ou 100.
- Ordenação fixa por data decrescente.
- Linha clicável: lote concluído abre o dashboard do lote; os demais abrem o status.
- Estado vazio com atalho para o Upload.

### RF-W06 — Softwares

- Tabela de `GET /api/v1/software`: nome, retenção, pacotes da aplicação, lotes, último lote, última versão.
- Edição em diálogo (`PATCH /api/v1/software/{name}`):
  - retenção de 1 a 3650 dias;
  - pacotes como *chips*, até 20, com validação de pacote Java.
- Texto de ajuda: os pacotes mudam o "seu código" também nas análises antigas.

### RF-W07 — Shell e estado global

- Barra superior com logo, indicador de saúde da API (`GET /actuator/health`, consultado a cada 30 s) e alternância de tema (padrão: preferência do sistema; escolha salva no `localStorage`).
- Navegação lateral: Upload, Histórico, Softwares.
- Aviso global quando a API ou um componente (`db`, `blobStorage`) estiver `DOWN`.
- Configuração carregada na inicialização: `GET /api/v1/config` e `/runtime-config.json`.

## 5. Requisitos não funcionais

| # | Requisito |
|---|---|
| RNF-W01 | **Sonar**: sem issues *Blocker*, *Critical* ou *Major*, no mesmo SonarQube da API. |
| RNF-W02 | **Cobertura**: ≥ 90% de linhas e de branches (Vitest + v8); `npm run test:ci` falha abaixo disso. |
| RNF-W03 | **Acessibilidade**: WCAG 2.1 AA; navegação por teclado; foco visível; prioridade, saúde e cobertura sempre com ícone e texto, além da cor; cada gráfico com resumo em texto. |
| RNF-W04 | **Desempenho**: rotas *lazy*; ECharts só nos dashboards; bundle inicial ≤ 500 kB gzip; dashboard com `topN=50` renderizado em ≤ 1 s após a resposta. |
| RNF-W05 | **Segurança**: HTML dos achados só pelo `DomSanitizer` do Angular (`[innerHTML]`); `localStorage` só guarda o tema; CSP no Nginx. |
| RNF-W06 | **Idioma e formatos**: textos pt-BR centralizados; locale `pt-BR`; datas no fuso do navegador. |
| RNF-W07 | **Docker**: imagem Nginx sem estado; logs em `${DATA_DIR}/frontend/logs`. |
| RNF-W08 | **Contrato**: tipos gerados do OpenAPI da API; teste de contrato acusa divergência. |
| RNF-W09 | **Navegadores**: modernos (*evergreen*): `browserslist` padrão do Angular 22 (Chrome, Edge, Firefox, Safari; desktop e mobile). |
| RNF-W10 | **Identidade visual**: tokens, tipografia e componentes da §7. |

## 6. Mensagens de erro

| `code` / situação | Mensagem | Onde |
|---|---|---|
| `INVALID_PARAMETER` | "Algum campo está inválido." + `detail` | formulário |
| `EMPTY_UPLOAD` | "Selecione ao menos um arquivo .jfr." | área de arquivos |
| `TOO_MANY_FILES` | "Envie no máximo {maxFiles} arquivos por lote." | área de arquivos |
| `INVALID_FILE` | "O arquivo não é uma gravação JFR válida." | linha do arquivo |
| `FILE_TOO_LARGE` | "Arquivo ou lote acima do limite ({limite})." | área de arquivos |
| `NOT_FOUND` | "Não encontrado." | página de não encontrado |
| `NOT_READY` | "A análise ainda não terminou." / erro da gravação | dashboard |
| `STORAGE_UNAVAILABLE` | "Armazenamento indisponível. Tente novamente em instantes." | aviso global |
| `INTERNAL_ERROR`, falha de rede | "Algo deu errado. Tente novamente." | aviso global com "tentar de novo" |
| `PARSE_ERROR` (gravação) | "Não foi possível ler este arquivo JFR. Ele pode estar truncado." | status do lote |
| `TIMEOUT` (gravação) | "O processamento passou do tempo limite." | status do lote |
| `BLOB_NOT_FOUND` (gravação) | "O arquivo não foi encontrado no armazenamento." | status do lote |

## 7. Identidade visual e visualizações

### 7.1. Identidade

Direção **diagnóstico clínico** (nota 09):
- **Cores**: marca azul-petróleo `#0B5563` (escuro: `#5CC4D6`); semáforo só para prioridade, saúde e cobertura: ALTA/crítico `#B42318`, MÉDIA/atenção `#9A5B00`, BAIXA `#3E5C68`, OK `#1E7A3D`, com equivalentes no tema escuro. Todos os pares têm contraste ≥ 4,5:1.
- **Fontes**: Inter (interface) e JetBrains Mono (código, frames, flags, comandos), empacotadas no app.
- **Logo**: `logo-mark.svg` (símbolo) e `logo.svg` (símbolo + nome).
- **Selo de saúde**: anel com a nota; crítico < 40, atenção 40–74, ok ≥ 75.
- **Cartão de diagnóstico**: borda e chip na cor da prioridade, o resto neutro. Ações começam por verbo.

### 7.2. Visualização por bloco

| Bloco | Visualização |
|---|---|
| CPU | série temporal (JVM usuário, JVM sistema, máquina), em % |
| Heap | série em área (usado) e linha (comprometido), com linha do heap máximo |
| GC | indicadores e tabela das maiores pausas |
| Threads | série (ativas e daemon) e indicadores |
| Hot methods, alocação, CPU por thread, exceções | barras horizontais com rótulo e marcador de `appFrame` próprio |
| Locks, I/O, vazamento | tabelas com `appFrame` e pilha recolhível |
| Comparativo (lote) | tabela com selo por linha |

Sem gráfico de pizza. Cada gráfico tem resumo em texto e `aria` habilitado.

### 7.3. Formatos

Bytes binários com 1 casa (`1,4 MB`, `1,7 GB/s`); frações de CPU em % (`2,0%`); durações (`70 ms`, `1,2 s`, `1 min 5 s`); datas `dd/MM/yyyy HH:mm` no fuso local (relativas no histórico, com a data completa no tooltip); frames `Classe.metodo:linha` com o pacote recolhido e botão de copiar.

## 8. Critérios de aceite

| # | Critério | Requisitos |
|---|---|---|
| CA-W01 | Enviar os 3 `.jfr` de exemplo leva ao status, que chega a `COMPLETED` sem recarregar a página. | RF-W01, RF-W02 |
| CA-W02 | O dashboard da gravação 1 mostra, no topo, `APP:TIERED_STOP_LEVEL`, `APP:ACTIVE_PROCESSOR_COUNT` e `JMC:Allocations.thread`, com `appFrame` e ação visíveis. | RF-W03 |
| CA-W03 | A cobertura mostra `EXCEPTIONS` e `FILE_IO` como `AUSENTE`, e o comando sugerido é copiado para a área de transferência. | RF-W03 |
| CA-W04 | "Ver dados" de um cartão rola até o bloco correspondente e atualiza o `#` da URL. | RF-W03 |
| CA-W05 | O dashboard do lote mostra "em N de M gravações", uma série por gravação e o comparativo. | RF-W04 |
| CA-W06 | Arquivo `.txt`, arquivo acima do limite, arquivos demais ou software inválido são barrados antes do envio; erros da API aparecem em pt-BR. | RF-W01 |
| CA-W07 | Lote `PARTIAL` mostra a gravação com `PARSE_ERROR` traduzido e o aviso de exclusão no consolidado. | RF-W02, RF-W04 |
| CA-W08 | No histórico, filtro e paginação atualizam a URL, e o link reproduz a visão. | RF-W05 |
| CA-W09 | Editar `appPackages` e reabrir o dashboard muda o `appFrame` exibido. | RF-W06 |
| CA-W10 | Cobertura ≥ 90% (linhas e branches) e Sonar sem *Blocker*, *Critical* ou *Major*. | RNF-W01, RNF-W02 |
| CA-W11 | `docker compose up` no repo da API sobe o front em `http://localhost:4200`, conversando com a API via proxy. | RNF-W07 |
| CA-W12 | axe sem violações *serious* ou *critical* nas 6 telas, nos dois temas. | RNF-W03 |
| CA-W13 | Limites alterados na API (ex.: `APP_UPLOAD_MAX_FILES=5`) passam a valer na validação do front sem rebuild. | RF-W01 |
| CA-W14 | Com a API fora do ar, o shell mostra o aviso e as telas oferecem "tentar de novo". | RF-W07 |

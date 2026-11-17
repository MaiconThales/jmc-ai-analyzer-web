---
tags: [jmc-ai-analyzer, web, v0-1-0, requisitos]
versao: 0.1.0
status: rascunho
---

# Requisitos

Voltar: [[00 Índice]] · Telas: [[04 Telas e fluxos]]

## Requisitos funcionais

### RF-W01 — Upload de gravações

- Seleção de **1 a 20** arquivos `.jfr`, por arrastar e soltar ou pelo seletor.
- Campos:
  - **software** (obrigatório): autocomplete com os softwares de `GET /api/v1/software`, aceitando um novo; validação do *slug* `^[a-z0-9][a-z0-9-]{1,63}$`, com ajuda visual;
  - **versão** (opcional);
  - **ambiente** (`PROD`, `HML`, `DEV`, `LOCAL`; opcional);
  - **descrição** (até 500 caracteres, com contador).
- Validações **antes de enviar**, com as mesmas regras da API: extensão `.jfr`, até 128 MB por arquivo, até 1 GB no total e até 20 arquivos. Os limites vêm de `GET /api/v1/config` da API, lido ao abrir o app ([[05 Integração com a API#Upload]]).
- **Progresso do envio** em percentual (eventos de upload do `HttpClient`), com opção de cancelar.
- Com `202`, navega para o **Status do lote**.
- Erros `400`, `413` e `503` aparecem junto ao campo ou ao arquivo responsável, com a mensagem em português ([[05 Integração com a API#Erros]]).

### RF-W02 — Status do lote

- Mostra software, versão, ambiente, descrição, estado do lote e a lista de gravações (nome, tamanho, estado, início e fim, erro).
- Faz **polling** de `GET /api/v1/analyses/{batchId}` a cada 2 s, até o lote sair de `PROCESSING`. O polling pausa com a aba oculta e para ao sair da tela.
- Gravações `COMPLETED` levam ao dashboard da gravação; as `FAILED` mostram `errorCode` e `errorMessage` traduzidos.
- Quando o lote termina, oferece o **Dashboard do lote** (se houver ao menos uma gravação concluída).

### RF-W03 — Dashboard da gravação

Ordem fixa dos blocos (ver [[04 Telas e fluxos#Dashboard da gravação]]):

1. **Cabeçalho**: arquivo, software, versão, JVM, duração, selo de saúde e seletor de `topN` (10, 20 ou 50).
2. **Diagnóstico**: cartões ordenados como vêm da API (prioridade e score). Cada cartão mostra prioridade, categoria, título, evidência, **local** (`appFrame` em destaque e a pilha recolhível) e **ação**. Um link "ver dados" rola até o bloco `domainRef`.
3. **Cobertura da gravação**: domínios `OK`, `INSUFICIENTE` ou `AUSENTE`, com motivo, recomendação e o **comando sugerido** com botão de copiar.
4. **Métricas por domínio**: CPU, heap, GC, threads, locks, hot methods, alocação, exceções, I/O, suspeitos de vazamento e CPU por thread. Blocos com `available: false` mostram o estado vazio e apontam a cobertura.
5. **Achados do JMC**: lista recolhível, com severidade, score, resumo, explicação e solução (HTML sanitizado).
6. **Metadados**: JVM, argumentos, SO, núcleos e memória.

- `409 NOT_READY` mostra o estado atual e o erro, com link para o status do lote.
- Mudar o `topN` refaz a consulta e atualiza a URL.

### RF-W04 — Dashboard do lote

- Mesmos blocos do dashboard da gravação, com as regras de consolidação da API.
- **Diagnóstico**: cada cartão mostra em quantas e em quais gravações o item aparece (`recordingIds`), com links.
- **Séries**: uma linha por gravação, com legenda pelo nome do arquivo.
- **Comparativo**: tabela com uma linha por gravação (duração, CPU média, pausa máxima de GC, nota de saúde, itens `ALTA`) e link para cada dashboard.
- Gravações excluídas (`FAILED`) aparecem num aviso no topo.

### RF-W05 — Histórico

- Tabela paginada de `GET /api/v1/analyses`: data, software, versão, ambiente, descrição, arquivos, estado, selo de saúde, itens `ALTA` e achados `WARNING`.
- Filtro por **software** (seleção com os cadastrados) e paginação de 20, 50 ou 100, refletidos na query string.
- Ordenação por data, mais recente primeiro (a API só ordena por campos do lote).
- Clicar numa linha abre o dashboard do lote se estiver concluído, ou o status se não estiver.

### RF-W06 — Softwares

- Lista de `GET /api/v1/software`: nome, retenção em dias, pacotes da aplicação, quantidade de lotes, último lote e última versão.
- **Edição** (`PATCH /api/v1/software/{name}`):
  - retenção de 1 a 3650 dias;
  - pacotes da aplicação como *chips*, com validação de pacote Java, até 20.
- Texto de ajuda: mudar os pacotes atualiza o `appFrame` também das análises antigas.

### RF-W07 — Navegação e estado global

- Shell com barra superior (nome do produto e alternância de tema) e navegação lateral: Upload, Histórico, Softwares.
- Indicador de saúde da API (`/actuator/health`), com aviso quando `blobStorage` ou `db` estiverem `DOWN`.
- Página "não encontrado" para rotas e IDs inexistentes (`404`).

## Requisitos não funcionais

| # | Requisito |
|---|---|
| RNF-W01 | **Sonar**: sem issues *Blocker*, *Critical* ou *Major*; mesmo SonarQube da API. |
| RNF-W02 | **Cobertura**: ≥ 90% de linhas e de branches nos testes unitários (Vitest + v8); o build falha abaixo disso. |
| RNF-W03 | **Acessibilidade**: WCAG 2.1 AA; navegação por teclado; prioridade e estado nunca indicados só pela cor (sempre com texto ou ícone); gráficos com resumo em texto. |
| RNF-W04 | **Desempenho**: rotas *lazy*; ECharts carregado só nos dashboards; bundle inicial ≤ 500 kB (gzip); dashboard renderizado em ≤ 1 s após a resposta da API com `topN = 50`. |
| RNF-W05 | **Segurança**: HTML dos achados só via sanitizador do Angular; nenhum dado sensível em `localStorage`; CSP no Nginx. |
| RNF-W09 | **Navegadores**: todos os navegadores modernos (*evergreen*) suportados pelo Angular 22: Chrome, Edge, Firefox e Safari, desktop e mobile, nas versões que a CLI declara no `browserslist` padrão. |
| RNF-W10 | **Identidade visual**: tokens, tipografia e componentes de [[09 Identidade visual]]. |
| RNF-W06 | **Idioma**: textos em pt-BR centralizados; datas no fuso do navegador, números no formato pt-BR. |
| RNF-W07 | **Docker**: imagem Nginx sem estado; logs do Nginx em `${DATA_DIR}/frontend/logs` (regra de persistência no host da API). |
| RNF-W08 | **Contrato**: os tipos da API são gerados do OpenAPI; teste de contrato falha se estiverem desatualizados. |

## Critérios de aceite

| # | Critério |
|---|---|
| CA-W01 | Enviar os 3 `.jfr` de exemplo leva ao status, que vira `COMPLETED` sem recarregar a página. |
| CA-W02 | O dashboard da gravação 1 mostra, no topo, `TIERED_STOP_LEVEL`, `ACTIVE_PROCESSOR_COUNT` e o achado de alocação do JMC, com `appFrame` e ação visíveis. |
| CA-W03 | A cobertura mostra exceções e I/O de arquivo como `AUSENTE` e permite copiar o comando sugerido. |
| CA-W04 | "Ver dados" de um cartão rola até o bloco correspondente. |
| CA-W05 | O dashboard do lote mostra `recordingIds` nos cartões, séries por gravação e o comparativo. |
| CA-W06 | Arquivo `.txt`, arquivo acima de 128 MB ou software inválido são barrados antes do envio; se a API recusar, a mensagem aparece em português. |
| CA-W07 | Um lote `PARTIAL` mostra a gravação com `PARSE_ERROR` e o aviso de exclusão no consolidado. |
| CA-W08 | No histórico, filtrar por software e paginar atualiza a URL; abrir o link reproduz a visão. |
| CA-W09 | Editar `appPackages` em Softwares e reabrir o dashboard muda o `appFrame` exibido. |
| CA-W10 | Cobertura de testes ≥ 90% e Sonar sem issues *Blocker*, *Critical* ou *Major*. |
| CA-W11 | `docker compose up` (no repo da API) sobe o front em `http://localhost:4200`, que conversa com a API via proxy. |
| CA-W12 | Teste automático de acessibilidade (axe) sem violações graves nas 6 telas. |

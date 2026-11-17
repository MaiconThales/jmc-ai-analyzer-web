---
tags: [jmc-ai-analyzer, web, v0-1-0, api]
versao: 0.1.0
status: rascunho
---

# Integração com a API

Voltar: [[00 Índice]] · Contrato: SDD da API (`jmc-ai-analyzer-api/.spec/0.1.0/spec.md`, §6) e `GET /v3/api-docs`

## Endpoints usados

| Tela | Chamada | Uso |
|---|---|---|
| Upload | `GET /api/v1/software` | autocomplete do software |
| Upload | `POST /api/v1/analyses` (multipart) | envio com progresso |
| Status | `GET /api/v1/analyses/{batchId}` | polling a cada 2 s |
| Dashboard do lote | `GET /api/v1/analyses/{batchId}/dashboard?topN=` | consolidado |
| Dashboard da gravação | `GET /api/v1/recordings/{recordingId}/dashboard?topN=` | por gravação |
| Histórico | `GET /api/v1/analyses?software=&page=&size=&sort=createdAt,desc` | lista paginada (`content` + `page`) |
| Softwares | `GET /api/v1/software` e `PATCH /api/v1/software/{name}` | lista e edição |
| Shell | `GET /actuator/health` | indicador de saúde |
| Inicialização | `GET /api/v1/config` | limites de upload e de `topN` (validação local) |

## Tipos gerados

- `npm run api:types`: `openapi-typescript http://localhost:8080/v3/api-docs -o src/app/core/api/generated/api.d.ts`.
- O arquivo gerado é versionado. Os clientes usam `components['schemas']['RecordingDashboard']` e semelhantes, com aliases em `core/api/models.ts`.
- **Teste de contrato** (no CI local / `npm run verify`): gera os tipos de novo a partir da API no Compose e falha se houver diferença.

> [!warning] Blocos genéricos no OpenAPI
> Na API, `CpuView<S>`, `HeapView<S>` e `ThreadsView<S>` são genéricos (a série é por métrica na gravação e por `recordingId` no lote). O springdoc pode gerar esses schemas de forma pouco precisa. O spike T-W02 confere o `api.d.ts` gerado; se precisar, os dois formatos de série são tipados à mão em `core/api/models.ts`.

## Erros

O interceptor converte toda resposta de erro em `ApiError { status, code, detail, properties }`. As mensagens exibidas são em português, por `code`, com o `detail` da API como complemento.

| `code` | Mensagem na tela | Onde aparece |
|---|---|---|
| `INVALID_PARAMETER` | "Algum campo está inválido." + `detail` | junto ao formulário |
| `EMPTY_UPLOAD` | "Selecione ao menos um arquivo .jfr." | área de arquivos |
| `TOO_MANY_FILES` | "Envie no máximo 20 arquivos por lote." | área de arquivos |
| `INVALID_FILE` | "O arquivo não é uma gravação JFR válida." | linha do arquivo |
| `FILE_TOO_LARGE` | "Arquivo ou lote acima do limite." | área de arquivos |
| `NOT_FOUND` | "Não encontrado." | página de não encontrado |
| `NOT_READY` | "A análise ainda não terminou." + estado, ou o erro da gravação | dashboard |
| `STORAGE_UNAVAILABLE` | "Armazenamento indisponível. Tente novamente em instantes." | aviso global |
| `INTERNAL_ERROR` / rede | "Algo deu errado. Tente novamente." | aviso global com "tentar de novo" |
| `PARSE_ERROR`, `TIMEOUT`, `BLOB_NOT_FOUND` | "Arquivo JFR ilegível", "Processamento excedeu o tempo", "Arquivo não encontrado no armazenamento" | linha da gravação no status |

## Polling

- Intervalo de 2 s, configurável em `runtime-config`.
- Pausa com a aba oculta (`document.visibilityState`) e para ao sair da rota.
- Para quando `status != PROCESSING`.
- Após 3 falhas de rede seguidas, mostra o aviso com "tentar de novo" e para.

## Upload

- `HttpClient.post` com `reportProgress: true` e `observe: 'events'`, para a barra de progresso.
- Cancelar o envio cancela a assinatura e, com ela, a requisição.
- A validação local usa os limites de `GET /api/v1/config` (`upload.maxFiles`, `maxFileSizeBytes`, `maxRequestSizeBytes`, `allowedExtension`), carregados uma vez na inicialização. Se a chamada falhar, o front usa os padrões da API (20, 128 MB, 1 GB) e a API continua sendo a validação final.

> [!success] Limites vindos da API (WQ2)
> A API ganhou `GET /api/v1/config` (RF-16 / CA-19 no SDD da API), já implementado e testado. Uma única fonte de configuração.

## Ajustes que a API pode precisar

| # | Ajuste | Motivo | Necessário? |
|---|---|---|---|
| A1 | Nenhum CORS | o front usa proxy na mesma origem | não precisa |
| A2 | `GET /api/v1/config` com limites de upload | evitar duplicar a configuração | **feito** |
| A3 | Ordenar o histórico por outros campos | hoje só pelos campos do lote | não para a v0.1.0 |
| A4 | Schemas OpenAPI sem genéricos para as séries | tipos gerados mais precisos | depende do spike T-W02 |

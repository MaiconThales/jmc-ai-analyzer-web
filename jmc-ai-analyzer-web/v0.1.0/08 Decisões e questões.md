---
tags: [jmc-ai-analyzer, web, v0-1-0, decisoes]
versao: 0.1.0
status: rascunho
---

# Decisões e questões

Voltar: [[00 Índice]]

## Decisões confirmadas (2026-11-17)

### W-D01 — Angular

> [!success] Decisão
> Angular 22.2 com standalone components e signals, Angular Material e ngx-echarts. O desenho original do projeto já previa Angular servido por Nginx.

### W-D02 — Repositório e documentação

> [!success] Decisão
> Front no repositório `jmc-ai-analyzer-web` (vazio, branch `refactore`). Notas Obsidian em `jmc-ai-analyzer-web/v0.1.0/` e, após aprovação, SDD em `.spec/0.1.0/` deste repositório.

### W-D03 — Telas da v0.1.0

> [!success] Decisão
> Upload e status, dashboards (gravação e lote), histórico e softwares.

## Decisões aprovadas na revisão

### W-D04 — Proxy na mesma origem

> [!success] Decisão
> O Nginx do front faz proxy de `/api` para a API. A API **não precisa de CORS** e o navegador fala com uma única origem. Em desenvolvimento, o `ng serve` usa `proxy.conf.json`.

### W-D05 — Tipos gerados do OpenAPI

> [!success] Decisão
> `openapi-typescript` gera os tipos a partir do `/v3/api-docs`. Isso evita divergência entre front e API; o teste de contrato acusa mudanças.

### W-D06 — Estado com signals, sem biblioteca de estado

> [!success] Decisão
> Um store por tela com `signal`/`computed`. Não há NgRx: o estado é local de cada tela, e não existe estado compartilhado complexo.

### W-D07 — Mesmos padrões de qualidade da API

> [!success] Decisão (WQ1)
> Cobertura ≥ 90% (linhas e branches), SonarQube sem *Blocker*/*Critical*/*Major* e sem CI na v0.1.0, como na API.

### W-D08 — Front no Compose da API

> [!success] Decisão
> O serviço `frontend` entra no `docker-compose.yml` da API (no bloco hoje comentado), com logs do Nginx em `${DATA_DIR}/frontend/logs`.

### W-D09 — Limites vindos da API (WQ2)

> [!success] Decisão
> A API ganhou `GET /api/v1/config` (implementado e testado). O front valida o upload com esses limites. Ver [[05 Integração com a API#Upload]].

### W-D10 — Identidade visual "diagnóstico clínico" (WQ3)

> [!success] Decisão
> Base calma, marca azul-petróleo e semáforo só para prioridade, saúde e cobertura. Logo com linha de pulso. Detalhes em [[09 Identidade visual]].

### W-D11 — Navegadores (WQ4)

> [!success] Decisão
> Todos os navegadores modernos: o `browserslist` padrão do Angular 22 (Chrome, Edge, Firefox e Safari, desktop e mobile).

### W-D12 — Faixas do selo de saúde (WQ5)

> [!success] Decisão
> Crítico < 40, atenção de 40 a 74, ok ≥ 75.

## Questões respondidas

- [x] **WQ1 — Qualidade** → sim → [[#W-D07 — Mesmos padrões de qualidade da API|W-D07]]
- [x] **WQ2 — Limites de upload** → API com `GET /api/v1/config` → [[#W-D09 — Limites vindos da API (WQ2)|W-D09]]
- [x] **WQ3 — Identidade visual** → criada → [[#W-D10 — Identidade visual "diagnóstico clínico" (WQ3)|W-D10]]
- [x] **WQ4 — Navegadores** → todos os modernos → [[#W-D11 — Navegadores (WQ4)|W-D11]]
- [x] **WQ5 — Faixas de saúde** → confirmadas → [[#W-D12 — Faixas do selo de saúde (WQ5)|W-D12]]

## Próximo passo

> [!success] SDD gerado em 2026-11-17 em `.spec/0.1.0/` deste repositório.

Mapeamento usado:

| Arquivo | Conteúdo principal |
|---|---|
| `.spec/0.1.0/spec.md` | [[01 Visão geral e escopo]], [[03 Requisitos]], [[04 Telas e fluxos]], [[05 Integração com a API]] e [[06 Visualizações]] |
| `.spec/0.1.0/plan.md` | [[02 Arquitetura]], [[09 Identidade visual]], [[05 Integração com a API]], [[06 Visualizações]] e [[07 Infraestrutura e qualidade]] |
| `.spec/0.1.0/tasks.md` | épicos: Bootstrap → Spike de tipos → Shell e core → Upload/status → Blocos e gráficos → Dashboards → Histórico/Softwares → Docker → Qualidade e E2E |

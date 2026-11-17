---
tags: [jmc-ai-analyzer, web, v0-1-0, escopo]
versao: 0.1.0
status: rascunho
---

# Visão geral e escopo

Voltar: [[00 Índice]]

## Objetivo

Permitir que um desenvolvedor pegue um ou vários `.jfr`, envie, e **em poucos cliques veja o que arrumar**:

1. **Enviar** as gravações, informando software, versão, ambiente e contexto.
2. **Acompanhar** o processamento.
3. Abrir o **dashboard** e ver primeiro o **diagnóstico priorizado**: problema, evidência, local no código (`appFrame`) e ação. Logo abaixo ficam a **cobertura da gravação** e as métricas e rankings que sustentam cada item.
4. Voltar depois pelo **histórico**, filtrando por software.
5. Ajustar, por software, a **retenção** e os **pacotes da aplicação**, para o dashboard apontar o código certo.

> [!important] Princípio de design
> O dashboard responde primeiro **"o que eu faço?"** e só depois **"quais são os números?"**. Cada item do diagnóstico leva ao bloco de métricas que o justifica (`domainRef`).

## Escopo

> [!success] Entra na v0.1.0
> - Telas: **Upload**, **Status do lote**, **Dashboard do lote** (consolidado), **Dashboard da gravação**, **Histórico** e **Softwares**.
> - Interface em **português (pt-BR)**, com tema claro e escuro.
> - Integração com todos os endpoints da API v0.1.0 (ver [[05 Integração com a API]]).
> - Tratamento de erros `problem+json` com mensagens em português por `code`.
> - Acompanhamento do processamento por polling, até o lote sair de `PROCESSING`.
> - Gráficos de séries temporais, rankings e indicadores (ver [[06 Visualizações]]).
> - Container Docker (Nginx) que entra no `docker-compose.yml` da API, no espaço reservado `frontend`.

> [!failure] Fica fora da v0.1.0
> - Autenticação e autorização (a API também não tem).
> - Telas de `ia` e `mcp`.
> - Tendência entre lotes e exportar relatório (dependem da API v0.2.0: P-06 e P-08).
> - Excluir lotes ou reprocessar gravações (a API não tem esses endpoints).
> - Internacionalização além do pt-BR.
> - Aplicativo mobile. A interface é responsiva, mas é pensada para desktop.

## Glossário

Os termos de domínio são os da API: lote, gravação, software, domínio, top-N, achado, item de diagnóstico, cobertura, `appFrame`, consolidado. Ver o glossário do SDD da API (§2).

| Termo do front | Significado |
|---|---|
| **Cartão de diagnóstico** | Componente que mostra um item do diagnóstico: prioridade, título, evidência, local e ação |
| **Bloco** | Seção do dashboard para um domínio (CPU, heap, GC...) |
| **Selo de saúde** | Nota de saúde de 0 a 100 exibida com cor |

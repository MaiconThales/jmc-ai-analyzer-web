---
tags: [jmc-ai-analyzer, web, v0-1-0, visualizacao]
versao: 0.1.0
status: rascunho
---

# Visualizações

Voltar: [[00 Índice]] · Dados: [[05 Integração com a API]]

## Bloco → visualização

| Bloco | Visualização | Dados da API |
|---|---|---|
| Diagnóstico | lista de **cartões** (não é gráfico) | `diagnosis[]` |
| Saúde | **selo** numérico com cor e rótulo ("crítico", "atenção", "ok") | `healthScore` |
| Cobertura | lista com ícone de estado e comando copiável | `coverage.items[]`, `suggestedCommand` |
| CPU | **série temporal** com 3 linhas (JVM usuário, JVM sistema, máquina) em % | `cpu.series` |
| Heap | **série temporal** em área (usado) e linha (comprometido), em bytes, com linha do heap máximo | `heap.series`, `maxBytes` |
| GC | indicadores (coletas, p95, máximo, % em pausa) e **tabela** das maiores pausas | `gc` |
| Threads | **série temporal** (ativas e daemon) e indicadores | `threads` |
| Hot methods | **barras horizontais** por % de amostras, com `appFrame` | `hotMethods.top[]` |
| Alocação | **barras horizontais** por bytes, com `appFrame` | `allocation.top[]` |
| Locks | **tabela** (tipo, classe, eventos, total, máximo) com `appFrame` | `locks.top[]` |
| Exceções | **barras** por quantidade e mensagem de exemplo | `exceptions.top[]` |
| I/O | totais por tipo e **tabela** por alvo (operações lentas) | `io.totals`, `io.top[]` |
| Vazamento | **tabela** (classe, amostras, idade máxima) com pilha de alocação | `leakSuspects.top[]` |
| CPU por thread | **barras horizontais** por CPU média | `threadCpu.top[]` |
| Comparativo (lote) | **tabela** com selo de saúde por linha | `comparison[]` |

> [!tip] Tabela antes de gráfico
> Rankings com nomes longos (métodos, classes, alvos) ficam mais legíveis como **barras horizontais com rótulo** ou **tabela**. Gráfico de pizza não é usado.

## Componentes de gráfico (`shared/charts`)

| Componente | Entrada | Observações |
|---|---|---|
| `time-series-chart` | séries `{nome, pontos[{ts, avg, max}]}`, unidade (`percent`, `bytes`, `count`) | mostra `avg` como linha e `max` como faixa clara; zoom por arrasto; tooltip com data local |
| `ranking-bar-chart` | itens `{rótulo, valor, destaque?}`, unidade | ordena por valor; itens com `appFrame` próprio ganham marcador |
| `health-badge` | `score` 0–100 | sem ECharts; cor e texto |

- ECharts com `renderer: 'canvas'` e `aria.enabled: true`. Cada gráfico tem um resumo em texto ao lado (exigência de acessibilidade).
- Tema claro e escuro definidos por tokens CSS, lidos ao inicializar o gráfico.
- No dashboard do lote, a série de cada gravação usa uma cor da paleta categórica, com a legenda pelo nome do arquivo.

## Cores e tokens

Valores e contrastes completos em [[09 Identidade visual#Paleta]].

| Token | Uso | Regra |
|---|---|---|
| `--prio-alta` | prioridade ALTA | sempre com ícone ▲ e texto "ALTA" |
| `--prio-media` | prioridade MÉDIA | ícone ■ e texto |
| `--prio-baixa` | prioridade BAIXA | ícone ● e texto |
| `--health-critico` | saúde < 40 | rótulo "crítico" |
| `--health-atencao` | saúde de 40 a 74 | rótulo "atenção" |
| `--health-ok` | saúde ≥ 75 | rótulo "ok" |
| `--coverage-ok` / `--coverage-insuficiente` / `--coverage-ausente` | cobertura | ícone ✓ / ◐ / ✗ e texto |

Contraste mínimo de 4,5:1 nos dois temas. As faixas de saúde são do front (a API só entrega o número) e ficam configuráveis.

## Formatação

| Dado | Formato |
|---|---|
| Bytes | binário com 1 casa: `1,4 MB`, `768 MB`, `1,7 GB/s` |
| Frações de CPU (0–1) | percentual: `2,0%` |
| Durações em ms | `70 ms`, `1,2 s`, `1 min 5 s` |
| Datas | fuso do navegador: `17/11/2026 14:02`; relativas no histórico ("há 2 h") com a data completa no tooltip |
| Frames | `Classe.metodo:linha`, com o pacote recolhido e um botão para copiar o nome completo |

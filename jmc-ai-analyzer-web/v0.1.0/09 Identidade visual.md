---
tags: [jmc-ai-analyzer, web, v0-1-0, identidade]
versao: 0.1.0
status: rascunho
---

# Identidade visual

Voltar: [[00 Índice]] · Aplicação nos gráficos: [[06 Visualizações#Cores e tokens]]

![[logo.svg]]

> [!abstract] Direção: diagnóstico clínico
> O JMC entrega dados corretos mas difíceis de ler. O produto faz o papel de um **laudo**: diz o que está errado, onde e o que fazer, com a calma de um exame médico. A base é limpa, a marca é **azul-petróleo** e o **semáforo** (vermelho, âmbar, verde) aparece **somente** em prioridade, saúde e cobertura. Assim, cor sempre significa algo.

Prévia navegável: `assets/identidade-preview.html` (abra no navegador). Ela tem logo, paleta, tipografia, um "antes e depois" com a saída real do JMC e os dois temas.

## Princípios

1. **A resposta vem primeiro.** Todo cartão termina numa **ação** começando por verbo ("Remova", "Reduza", "Grave"). Números são evidência, não manchete.
2. **Cor é significado.** Vermelho, âmbar e verde ficam reservados para prioridade, saúde e cobertura. A marca nunca usa essas cores, e nenhum estado depende só da cor: sempre há ícone e texto.
3. **Código é cidadão de primeira.** O `appFrame` aparece em fonte monoespaçada, com o ícone de alfinete e "seu código", em destaque azul-petróleo e copiável. Pacotes longos ficam recolhidos; na pilha, os frames do JDK ficam atenuados e o da aplicação, destacado.
4. **Densidade calma.** Muito espaço em branco, um único destaque por cartão e gráficos sem enfeites (sem 3D, sem pizza, sem gradiente decorativo).
5. **Linguagem humana.** Português direto, sem jargão desnecessário. Termos técnicos (`-XX:...`, nomes de classe) ficam em monoespaçado. O texto original do JMC fica disponível em "achados do JMC", nunca escondido.

## Logo

| Arquivo | Uso |
|---|---|
| `assets/logo-mark.svg` | símbolo: favicon, ícone do app e barra lateral recolhida |
| `assets/logo.svg` | símbolo + nome + descritor: barra superior e tela de boas-vindas |

- **Símbolo**: quadrado arredondado azul-petróleo com uma **linha de pulso**, os sinais vitais da JVM, que termina num ponto ciano: o problema encontrado e resolvido.
- **Nome**: "JMC AI Analyzer" em Inter Bold; descritor "diagnóstico de gravações JFR" em Inter Medium.
- **Área de respiro**: metade da altura do símbolo em volta. Tamanho mínimo de 16 px (favicon só com o símbolo).
- **Não fazer**: recolorir o símbolo com cores do semáforo, distorcer, aplicar sombra ou contorno.

## Paleta

Contraste conferido (WCAG 2.1) sobre a superfície de cada tema. Todos os textos e ícones ficam em ≥ 4,5:1.

### Tema claro

| Token | Cor | Uso | Contraste |
|---|---|---|---|
| `--brand` | `#0B5563` | marca, links, botões primários, foco | 8,4:1 |
| `--brand-strong` | `#073B45` | hover e pressionado | 12,2:1 |
| `--accent` | `#5CC4D6` | detalhes do logo e realces (nunca texto) | — |
| `--text` | `#14232A` | texto principal | 16,1:1 |
| `--text-muted` | `#4E626B` | texto secundário | 6,4:1 |
| `--bg` / `--surface` | `#F3F6F7` / `#FFFFFF` | fundo e cartões | — |
| `--surface-2` | `#F6F9FA` | cabeçalho de tabela, chips, áreas internas | — |
| `--border` / `--border-strong` | `#DDE5E8` / `#C5D2D7` | divisórias / campos e hover | — |
| `--health-ok-soft` | `#E6F4EA` | fundo de "API ok", "Concluído" e arquivo válido | — |
| `--prio-alta`, `--health-critico` | `#B42318` | ALTA, saúde < 40, cobertura AUSENTE | 6,6:1 |
| `--prio-media`, `--health-atencao` | `#9A5B00` | MÉDIA, saúde 40–74, INSUFICIENTE | 5,4:1 |
| `--prio-baixa` | `#3E5C68` | BAIXA | 7,2:1 |
| `--health-ok` | `#1E7A3D` | saúde ≥ 75, cobertura OK | 5,4:1 |

### Tema escuro

| Token | Cor | Contraste |
|---|---|---|
| `--brand` | `#5CC4D6` | 7,8:1 |
| `--text` / `--text-muted` | `#E6EEF0` / `#9DB2BA` | 13,4:1 / 7,1:1 |
| `--bg` / `--surface` / `--surface-2` | `#0A1215` / `#111C20` / `#152328` | — |
| `--border` / `--border-strong` | `#22343A` / `#31484F` | — |
| `--prio-alta` | `#FF8A7A` | 6,9:1 |
| `--prio-media` | `#F5B94E` | 9,0:1 |
| `--prio-baixa` | `#9FB8C2` | 7,6:1 |
| `--health-ok` | `#6FD08C` | 8,3:1 |

### Séries dos gráficos

Paleta categórica para as linhas de cada gravação no dashboard do lote, sem usar as cores do semáforo: `#0B5563`, `#7A5AA6`, `#2F7EC1`, `#A0558D`, `#4C7A2E`, `#8C6D3F`. No tema escuro, as versões claras correspondentes.

## Tipografia

| Papel | Fonte | Tamanho / peso |
|---|---|---|
| Títulos de tela | Inter | 28 px / 800 |
| Título do cartão | Inter | 17 px / 700 |
| Corpo | Inter | 15 px / 400 |
| Rótulos e chips | Inter | 12 px / 700, caixa alta com espaçamento |
| Código, frames, flags, comandos | JetBrains Mono | 13 px / 400 |

As duas fontes são livres (SIL OFL) e ficam **empacotadas no app** (`@fontsource/inter`, `@fontsource/jetbrains-mono`), sem CDN externo.

## Superfícies, sombras e ícones

- **Cartões** (`.panel`, `.kpi`, `.card`): raio de 14 px, borda de 1 px e sombra leve (`--shadow-sm`); no hover, sombra `--shadow` e subida de 2 px nos KPIs.
- **KPIs** (inspirados no simulador de telemetria): rótulo pequeno, valor em JetBrains Mono e uma faixa à esquerda na cor do significado (alta, média, baixa, ok ou neutro).
- **Ícones**: SVG próprios de traço (24×24, `currentColor`) no componente `app-icon`; nunca sozinhos quando carregam significado (sempre com texto ou `aria-label`).
- **Botões**: `.btn` (neutro), `.btn.primary` (marca, com sombra suave) e `.btn.ghost` (link com fundo no hover).

## Movimento

| Token | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | todas as transições |
| `--dur-fast` / `--dur` / `--dur-slow` | 140 / 220 / 380 ms | hover · troca de estado · entrada de tela |

- **Entrada de tela**: o conteúdo desliza 8 px para cima e aparece; cartões, linhas e KPIs entram em cascata (45 ms entre itens, até 12).
- **Selo de saúde**: o anel "enche" até a nota ao aparecer (com `@property`; sem suporte, mostra o valor final).
- **Estados**: esqueleto com brilho no carregamento; ícone girando em "Processando"; ponto pulsando em "API ok".
- **Regras**: só `transform` e `opacity`; preenchimento `backwards` (depois de terminar, a animação não deixa `transform` aplicado, o que quebraria diálogos `fixed`); tudo desligado com `prefers-reduced-motion: reduce`.

## Componentes-chave

### Cartão de diagnóstico

```text
┃ ▲ ALTA   AMBIENTE   em 2 de 3 gravações            ← chip de prioridade + categoria (+ alcance no lote)
┃ Outros processos consumindo CPU                     ← título (o problema)
┃ 43% da CPU foi usada por outros processos.          ← evidência (texto secundário)
┃ 📍 seu código: HexaUtil.converteString:23 [Copiar]  ← local (monoespaçado, destacado), quando houver
┃ ▸ pilha (5)                                         ← pilha recolhível, frame da aplicação destacado
┃ ┌ → COMO ARRUMAR ─────────────────────────┐         ← ação (verbo no início) em bloco próprio
┃ │ Grave num ambiente isolado.              │
┃ └──────────────────────────────────────────┘
┃ ver dados ↓   app-1.jfr   app-2.jfr                 ← link para o bloco (domainRef) e gravações
```

A faixa esquerda e o chip usam a cor da prioridade; nos itens ALTA, um degradê muito leve da cor entra pela esquerda. O resto do cartão é neutro. Acima da lista, um **filtro** (Todas · ALTA · MÉDIA · BAIXA, com contagem) mostra só uma prioridade.

### Selo de saúde

Anel com a nota no centro (monoespaçada) e o rótulo ao lado: **crítico** (< 40), **atenção** (40–74) ou **ok** (≥ 75). As faixas foram confirmadas na WQ5. A versão compacta (tabelas) mostra só o anel menor.

### Estados vazios

Ilustração mínima (o símbolo em cinza), uma frase e uma ação. Exemplo: "Esta gravação não tem eventos de exceção. → Veja como gravar na cobertura."

## Voz e tom

| Em vez de | Escrever |
|---|---|
| "The most allocated type is likely ''java.lang.String''" | "O tipo mais alocado é java.lang.String." |
| "Erro 409" | "A análise ainda não terminou." |
| "Falha de parsing" | "Não foi possível ler este arquivo JFR. Ele pode estar truncado." |
| "Clique aqui" | "Ver dados de CPU" |

- Segunda pessoa implícita e verbos no imperativo nas ações.
- Números formatados para leitura (`1,7 GB/s`, `70 ms`), nunca em bytes crus.

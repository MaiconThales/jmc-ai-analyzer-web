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
3. **Código é cidadão de primeira.** O `appFrame` aparece em fonte monoespaçada, com 📍 "seu código", copiável. Pacotes longos ficam recolhidos.
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
| `--bg` / `--surface` | `#F7F9FA` / `#FFFFFF` | fundo e cartões | — |
| `--prio-alta`, `--health-critico` | `#B42318` | ALTA, saúde < 40, cobertura AUSENTE | 6,6:1 |
| `--prio-media`, `--health-atencao` | `#9A5B00` | MÉDIA, saúde 40–74, INSUFICIENTE | 5,4:1 |
| `--prio-baixa` | `#3E5C68` | BAIXA | 7,2:1 |
| `--health-ok` | `#1E7A3D` | saúde ≥ 75, cobertura OK | 5,4:1 |

### Tema escuro

| Token | Cor | Contraste |
|---|---|---|
| `--brand` | `#5CC4D6` | 7,8:1 |
| `--text` / `--text-muted` | `#E6EEF0` / `#9DB2BA` | 13,4:1 / 7,1:1 |
| `--bg` / `--surface` | `#0F1A1D` / `#16252A` | — |
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

## Componentes-chave

### Cartão de diagnóstico

```text
┃ ▲ ALTA   AMBIENTE                                   ← chip de prioridade + categoria
┃ Outros processos consumindo CPU                     ← título (o problema)
┃ 43% da CPU foi usada por outros processos.          ← evidência (texto secundário)
┃ 📍 seu código: HexaUtil.converteString:23  [pilha▸] ← local (monoespaçado), quando houver
┃ ➜ Grave num ambiente isolado.                       ← ação (verbo no início)
┃ ver dados de CPU ↓                                  ← link para o bloco (domainRef)
```

A borda esquerda e o chip usam a cor da prioridade; o resto do cartão é neutro.

### Selo de saúde

Anel com a nota no centro e o rótulo ao lado: **crítico** (< 40), **atenção** (40–74) ou **ok** (≥ 75). As faixas foram confirmadas na WQ5.

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

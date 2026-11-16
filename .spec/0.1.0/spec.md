# Especificação do Frontend: Dashboard JFR/MCP

## 1. Objetivo

Criar uma aplicação Angular para apresentar, de forma clara para um humano, os resultados produzidos pelo backend a partir das ferramentas do `mcp-server-jmc` e a interpretação gerada pela camada de IA após a conclusão das análises MCP.

O frontend não deve executar diretamente o processo Java, acessar arquivos JFR, implementar regras de análise ou chamar o provedor de IA. Essas responsabilidades pertencem ao backend. O frontend consome a API HTTP do backend e transforma os resultados objetivos e a interpretação em indicadores, gráficos, tabelas e detalhes navegáveis.

## 2. Escopo

### 2.1. Incluído

* Seleção de um arquivo JFR disponível no backend.
* Solicitação de uma nova análise.
* Acompanhamento do estado da análise.
* Visualização de resumo executivo.
* Visualização de diagnósticos automatizados.
* Visualização de métodos com maior consumo de CPU.
* Visualização de GC, heap e classes alocadas.
* Visualização de contenções de locks.
* Visualização de exceções frequentes.
* Visualização de resumo executivo gerado pela IA.
* Visualização de principais achados, prioridades, hipóteses e recomendações da IA.
* Indicação do estado da interpretação por IA.
* Visualização do histórico de análises concluídas.
* Abertura dos detalhes de uma análise anterior.
* Tratamento visual de erros parciais e totais.
* Execução no navegador a partir de um container Docker.

### 2.2. Fora do escopo inicial

* Autenticação e autorização.
* Gerenciamento de usuários.
* Comunicação direta do navegador com STDIO/MCP.
* Leitura direta de arquivos JFR pelo navegador.
* Edição ou exclusão de dados históricos pela interface.
* Monitoramento contínuo de métricas.
* Comparação avançada entre múltiplas gravações.
* Upload de arquivos pela internet.
* Chamada direta a provedores de IA pelo navegador.

## 3. Usuário e fluxo principal

O usuário é um desenvolvedor ou analista que deseja interpretar uma gravação JFR sem ler respostas JSON ou executar várias ferramentas MCP manualmente.

Fluxo principal:

1. Abrir o dashboard.
2. Consultar os arquivos JFR disponíveis.
3. Selecionar um arquivo.
4. Solicitar a análise.
5. Acompanhar o progresso das ferramentas.
6. Aguardar a interpretação pós-MCP, quando habilitada.
7. Visualizar o resumo técnico e o resumo interpretativo da IA.
8. Navegar pelos detalhes de CPU, memória, locks, exceções e diagnósticos.
9. Reabrir análises anteriores pelo histórico.

## 4. Requisitos funcionais

### RF-01 — Listar arquivos JFR

O frontend deve consultar o backend e apresentar os arquivos JFR disponíveis, incluindo nome, tamanho, data de modificação e, quando informado, duração da gravação.

### RF-02 — Iniciar análise

O frontend deve permitir iniciar uma análise para um arquivo selecionado e apresentar o identificador retornado pelo backend.

### RF-03 — Acompanhar progresso

O frontend deve atualizar o estado da análise e mostrar o estado individual das etapas:

* diagnósticos automatizados;
* métodos quentes;
* GC e memória;
* contenções;
* exceções.

Estados mínimos: `PENDING`, `RUNNING`, `COMPLETED`, `PARTIAL`, `FAILED`.

### RF-04 — Exibir resumo

O resumo deve apresentar, quando disponível:

* quantidade de diagnósticos;
* maior severidade;
* maior score;
* maior pausa de GC;
* tempo total de pausa;
* heap antes e depois;
* percentual de CPU dos principais métodos;
* tempo total de contenção;
* quantidade de exceções.

### RF-05 — Exibir diagnósticos

Cada diagnóstico deve apresentar regra, score, severidade, resumo e solução recomendada. A severidade deve possuir diferenciação visual consistente.

### RF-06 — Exibir análises técnicas

O frontend deve apresentar os resultados como tabelas e gráficos adequados, evitando exibir grandes blocos de JSON como conteúdo principal.

### RF-07 — Exibir falhas parciais

Se uma ferramenta falhar e outras concluírem, o frontend deve exibir os resultados disponíveis e indicar claramente qual etapa falhou e a mensagem retornada pelo backend.

### RF-08 — Consultar histórico

O frontend deve listar análises anteriores com data, arquivo, estado e indicadores resumidos, permitindo abrir uma análise concluída.

### RF-09 — Exibir interpretação da IA

Quando a interpretação estiver disponível, o frontend deve apresentar resumo executivo, severidade geral, principais achados, hipóteses ou possíveis causas, recomendações, modelo e provedor utilizados e versão do prompt, quando informados.

O frontend deve diferenciar claramente fatos obtidos pelo MCP de hipóteses ou recomendações geradas pela IA.

### RF-10 — Exibir falha da IA

Se as análises MCP forem concluídas, mas a interpretação da IA falhar, o frontend deve manter todos os dados técnicos disponíveis e indicar que a interpretação não foi gerada.

## 5. Requisitos não funcionais

* A aplicação deve ser escrita em Angular e TypeScript.
* O frontend deve ser responsivo para resolução desktop e tablet.
* O frontend não deve conter credenciais, segredos ou configuração de banco.
* URLs da API devem ser configuráveis por variável de ambiente ou arquivo de configuração de build.
* Erros de rede devem possuir mensagem compreensível e ação de tentar novamente.
* A interface deve preservar unidades: bytes, milissegundos, segundos e percentual.
* Stack traces devem aparecer em áreas expansíveis e com fonte monoespaçada.
* A aplicação deve ser compilada para arquivos estáticos e servida por um container web.

## 6. Modelo visual mínimo

* **Página inicial:** seleção de arquivo e últimas análises.
* **Página de análise:** status, progresso e resultado.
* **Resumo:** cards e alertas principais.
* **CPU:** gráfico de barras e tabela de métodos.
* **Memória:** indicadores de GC, heap e alocações.
* **Locks:** tabela ordenada por tempo bloqueado.
* **Exceções:** tabela ordenada por ocorrências.
* **Diagnósticos:** lista ordenada por severidade e score.
* **Interpretação:** resumo executivo, achados e recomendações da IA, com aviso de que se trata de interpretação assistida.

## 7. Critérios de aceite

1. O dashboard consegue listar um arquivo JFR fornecido pelo backend.
2. O usuário consegue iniciar uma análise sem conhecer os nomes das tools MCP.
3. O progresso de cada etapa é visível.
4. Uma análise concluída apresenta resumo e todas as seções disponíveis.
5. Uma falha parcial não oculta os resultados concluídos.
6. O histórico permite abrir uma análise já concluída.
7. A interpretação da IA aparece separada dos dados técnicos MCP.
8. A indisponibilidade da IA não oculta uma análise MCP concluída.
9. O frontend é executável a partir do container Docker definido no plano.
10. Não existe comunicação direta do navegador com o processo MCP ou com o provedor de IA.

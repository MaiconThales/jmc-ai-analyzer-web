# Plano Técnico do Frontend: Dashboard JFR/MCP

## 1. Stack

* Angular e TypeScript.
* Angular Router para navegação.
* HttpClient para comunicação REST.
* RxJS para polling, cancelamento e composição de estados.
* Biblioteca de gráficos compatível com Angular, preferencialmente Apache ECharts ou Chart.js.
* Testes unitários com o executor padrão do projeto Angular.
* Nginx no container de produção para servir os arquivos compilados.

## 2. Organização sugerida

```text
frontend/
├── src/app/
│   ├── core/
│   │   ├── api/
│   │   ├── models/
│   │   └── services/
│   ├── shared/
│   │   ├── components/
│   │   ├── formatters/
│   │   └── ui/
│   └── features/
│       ├── dashboard/
│       ├── analysis/
│       ├── history/
│       └── jfr-files/
├── Dockerfile
└── nginx.conf
```

## 3. Modelos TypeScript

Os modelos devem representar o contrato consolidado do backend, e não os DTOs internos do servidor MCP.

Modelos mínimos:

* `JfrFile`;
* `AnalysisSummary`;
* `AnalysisSession`;
* `AnalysisStage`;
* `AiInterpretation`;
* `AiFinding`;
* `AiRecommendation`;
* `RuleDiagnostic`;
* `HotMethod`;
* `GcMemorySummary`;
* `AllocatedClass`;
* `LockContention`;
* `FrequentException`;
* `Page<T>` para histórico paginado, se a paginação for disponibilizada.

## 4. Comunicação com o backend

Endpoints consumidos pelo frontend:

```text
GET  /api/v1/jfr-files
POST /api/v1/analyses
GET  /api/v1/analyses/{analysisId}
GET  /api/v1/analyses/{analysisId}/status
GET  /api/v1/analyses/history
GET  /api/v1/analyses/{analysisId}/interpretation
```

O frontend deve usar polling inicialmente para consultar o estado. WebSocket ou Server-Sent Events podem ser adicionados posteriormente sem alterar o modelo visual.

O estado da interpretação deve ser recebido como parte da sessão ou de um endpoint específico. A interpretação somente deve ser exibida como pronta quando o backend indicar `COMPLETED`.

## 5. Estado da aplicação

O estado deve ser local às páginas e serviços Angular, sem introduzir uma biblioteca global antes de existir necessidade real.

* `JfrFileService`: consulta arquivos.
* `AnalysisService`: inicia, consulta e cancela o polling.
* `HistoryService`: consulta o histórico.
* `NotificationService`: mensagens de erro, sucesso e alerta.

O frontend não terá um serviço de provedor de IA. Toda integração com modelo, prompt, credencial e provedor fica no backend.

## 6. Formatação e visualização

* Bytes devem ser convertidos para KB, MB ou GB.
* Durações devem ser exibidas em ms ou s conforme o valor.
* Percentuais devem possuir no máximo duas casas decimais.
* Diagnósticos devem ser ordenados por severidade e score.
* Métodos, locks e exceções devem ser ordenados pelo indicador principal.
* A interpretação da IA deve possuir identificação visual própria e não ser apresentada como fato bruto do JFR.
* Recomendações devem ser exibidas junto dos achados que as motivaram, quando essa relação existir.
* Listas longas devem possuir limite visual, paginação ou expansão.
* Stack traces e soluções devem usar componentes expansíveis.

## 7. Docker

O build de produção deve ocorrer em múltiplos estágios:

1. Imagem Node para instalar dependências e executar `ng build`.
2. Imagem Nginx para servir `dist/`.

O container frontend não deve conter o código-fonte Java, o JAR MCP ou credenciais de banco. A URL do backend deve ser injetada por configuração de runtime ou definida pelo proxy reverso.

## 8. Decisões e limites

* Não implementar autenticação.
* Não acessar PostgreSQL diretamente.
* Não duplicar a lógica de agregação JFR.
* Não chamar diretamente APIs de IA.
* Não tratar uma recomendação da IA como diagnóstico determinístico.
* Não expor stack traces completas por padrão em tabelas.
* Não executar comandos do sistema no navegador.
* Não assumir que todas as etapas da análise retornam dados.

## 9. Testes

* Testar serviços HTTP com mocks.
* Testar estados `PENDING`, `RUNNING`, `COMPLETED`, `PARTIAL` e `FAILED`.
* Testar formatação de bytes, duração e percentual.
* Testar renderização de diagnóstico crítico e normal.
* Testar que falha de uma etapa mantém as outras visíveis.
* Testar interpretação concluída, pendente e indisponível.
* Testar que uma falha da IA mantém os resultados MCP visíveis.
* Executar build de produção dentro do container.

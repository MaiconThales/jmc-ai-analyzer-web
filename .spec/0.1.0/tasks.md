# Tasks do Frontend: Dashboard JFR/MCP

## Épico 1 — Bootstrap e infraestrutura

- [x] **F1.1:** Criar aplicação Angular em `frontend/` com TypeScript e Router.
- [x] **F1.2:** Definir configurações de ambiente para a URL do backend.
- [ ] **F1.3:** Configurar lint, testes e build de produção.
- [x] **F1.4:** Criar `Dockerfile` multi-stage e configuração Nginx.
- [x] **F1.5:** Validar execução do frontend no container.

## Épico 2 — Modelos e integração REST

- [x] **F2.1:** Criar interfaces TypeScript para arquivos JFR e sessão de análise.
- [x] **F2.2:** Criar interfaces para diagnósticos, CPU, memória, locks e exceções.
- [x] **F2.3:** Implementar `JfrFileService`.
- [x] **F2.4:** Implementar `AnalysisService` para iniciar e consultar análises.
- [x] **F2.5:** Implementar `HistoryService`.
- [x] **F2.6:** Implementar tratamento padronizado de erros HTTP.
- [x] **F2.7:** Criar modelos TypeScript para interpretação, achados e recomendações da IA.

## Épico 3 — Seleção e execução

- [x] **F3.1:** Criar tela de listagem de arquivos JFR.
- [x] **F3.2:** Criar ação de início de análise.
- [x] **F3.3:** Criar componente de progresso por etapa.
- [x] **F3.4:** Implementar polling com encerramento ao concluir ou falhar.
- [x] **F3.5:** Exibir falhas parciais sem esconder resultados válidos.

## Épico 4 — Visualização

- [x] **F4.1:** Criar resumo executivo com cards.
- [x] **F4.2:** Criar seção de diagnósticos.
- [x] **F4.3:** Criar gráfico e tabela de CPU.
- [x] **F4.4:** Criar seção de GC, heap e alocações.
- [x] **F4.5:** Criar seção de contenções.
- [x] **F4.6:** Criar seção de exceções.
- [x] **F4.7:** Criar componentes expansíveis para stack traces e soluções.
- [x] **F4.8:** Criar seção de interpretação pós-MCP.
- [x] **F4.9:** Diferenciar visualmente dados técnicos e recomendações da IA.
- [x] **F4.10:** Exibir estado e falha da interpretação sem ocultar os resultados MCP.

## Épico 5 — Histórico e qualidade

- [x] **F5.1:** Criar tela de histórico.
- [x] **F5.2:** Permitir abrir uma análise anterior.
- [x] **F5.3:** Adicionar estados de carregamento, vazio e erro.
- [ ] **F5.4:** Cobrir serviços e componentes principais com testes.
- [ ] **F5.5:** Validar o build final com Docker Compose.
- [ ] **F5.6:** Validar a abertura de histórico com interpretação persistida.

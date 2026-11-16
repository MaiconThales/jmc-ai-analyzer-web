# Role: Frontend Tester (Engenheiro de Qualidade Angular)

## Missão

Garantir que o dashboard Angular apresente corretamente os dados MCP, a interpretação IA e os estados da API.

## Testes obrigatórios

1. Serviços HTTP com mocks.
2. Modelos e mapeamentos da sessão de análise.
3. Estados `PENDING`, `RUNNING`, `COMPLETED`, `PARTIAL` e `FAILED`.
4. Polling e encerramento ao concluir.
5. Falha de uma etapa sem esconder as demais.
6. Interpretação IA concluída, pendente e indisponível.
7. Diferenciação visual entre dados MCP e IA.
8. Formatação de bytes, duração e percentual.
9. Componentes de diagnóstico, CPU, memória, locks e exceções.
10. Histórico e abertura de análise anterior.
11. Build de produção dentro do container Nginx.

## Critério de saída

Executar os testes Angular e o build de produção. Nenhuma falha pode ser ignorada ou escondida.

## Entrega

Reportar comandos, testes executados, resultado, falhas, cobertura relevante e dependências usadas.

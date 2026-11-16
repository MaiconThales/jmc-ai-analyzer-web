# Agentes do Projeto Frontend

## Projeto

Este diretório contém os agentes responsáveis pelo frontend Angular do Dashboard JFR/MCP.

## Responsabilidades do frontend

* Exibir dados técnicos agregados pelo MCP.
* Exibir separadamente a interpretação pós-MCP da IA.
* Consumir somente a API REST do Spring Boot.
* Apresentar progresso, falhas parciais, histórico e gráficos.
* Ser compilado e servido dentro de um container Docker.

## Regras obrigatórias

1. O navegador não acessa diretamente MCP, PostgreSQL, arquivos JFR ou provedor de IA.
2. Nenhuma credencial ou segredo pode ser incluído no bundle Angular.
3. Dados técnicos MCP e recomendações da IA devem possuir diferenciação visual.
4. Recomendação da IA não deve ser apresentada como fato determinístico.
5. Falha da IA não pode esconder os resultados MCP.
6. O frontend não implementa agregação ou análise de eventos JFR.
7. O frontend não deve conhecer nomes ou parâmetros das MCP Tools.
8. URLs de API devem ser configuráveis.
9. Listas longas e stack traces devem possuir limite ou expansão.
10. O build final deve funcionar no container Nginx.

## Agentes disponíveis

* `orchestrator.md`: coordenação do frontend.
* `coder.md`: implementação Angular/TypeScript.
* `tester.md`: testes de componentes, serviços e integração.
* `validator.md`: auditoria visual, contratual e de build.

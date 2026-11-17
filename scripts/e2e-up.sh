#!/usr/bin/env bash
# Sobe a pilha completa (Compose do repositório da API, que inclui o front) para os testes E2E.
set -euo pipefail
API_REPO="${API_REPO:-../jmc-ai-analyzer-api}"
cd "$API_REPO"
docker compose up -d --build
echo "Aguardando o front ficar saudável..."
for _ in $(seq 1 60); do
  status=$(docker compose ps --format '{{.Service}} {{.Health}}' | awk '$1=="frontend"{print $2}')
  [[ "$status" == "healthy" ]] && { echo "Pronto: http://localhost:${FRONTEND_PORT:-4200}"; exit 0; }
  sleep 3
done
echo "O front não ficou saudável a tempo." >&2
exit 1

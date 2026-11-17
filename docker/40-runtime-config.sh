#!/bin/sh
# Gera /runtime-config.json a partir das variáveis do container (opções que não vêm da API).
set -eu
interval="${POLLING_INTERVAL_MS:-2000}"
case "$interval" in
  ''|*[!0-9]*) interval=2000 ;;
esac
printf '{ "pollingIntervalMs": %s }\n' "$interval" > /usr/share/nginx/html/runtime-config.json

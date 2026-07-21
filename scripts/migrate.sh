#!/usr/bin/env bash
set -euo pipefail
p="$(cd "$(dirname "$0")/.."&&pwd)";set -a;. "$p/.env";set +a;: "${DATABASE_URL:?DATABASE_URL required}";psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$p/server/database/schema.sql";for m in "$p"/server/migrations/*.sql;do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$m";done

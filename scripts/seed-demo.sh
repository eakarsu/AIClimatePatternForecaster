#!/usr/bin/env bash
set -euo pipefail
p="$(cd "$(dirname "$0")/.."&&pwd)";set -a;. "$p/.env";set +a;case "${CONFIRM_DEMO_SEED:-}" in yes|YES);;*)echo 'Set CONFIRM_DEMO_SEED=yes; startup never seeds.' >&2;exit 1;;esac;(cd "$p"&&npm run seed)

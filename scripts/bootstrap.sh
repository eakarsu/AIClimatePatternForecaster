#!/usr/bin/env bash
set -euo pipefail
p="$(cd "$(dirname "$0")/.."&&pwd)";[ -f "$p/.env" ]||cp "$p/.env.example" "$p/.env";(cd "$p"&&npm ci);(cd "$p/client"&&npm ci)

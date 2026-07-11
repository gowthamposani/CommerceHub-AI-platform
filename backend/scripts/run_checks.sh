#!/usr/bin/env bash
set -euo pipefail

ruff check .
black --check .
isort --check-only .
mypy app tests
pytest


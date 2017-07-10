#!/usr/bin/env bash
set -e

# Lint
echo ""
echo "| Linting..."
yarn lint

# Type checking
echo ""
echo "| Type checking..."
yarn flow

# Source test env vars
echo ""
echo "| Configuring env vars..."
export NODE_ENV=test
export API_BASE_URL='https://fake.co' 

# Run tests
echo "| Running tests..."
echo "$@"
./node_modules/.bin/jest --config test/config/jest-config.json --no-cache "$@"

#!/bin/bash

echo "Running pre-commit checks..."

if [ -f package.json ]; then
  echo "Checking lint..."
  npm run lint >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "Lint failed. Commit blocked."
    exit 1
  fi

  echo "Checking tests..."
  npm test -- --runInBand >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "Tests failed. Commit blocked."
    exit 1
  fi
fi

echo "Pre-commit checks passed."
exit 0

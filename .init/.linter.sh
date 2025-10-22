#!/bin/bash
cd /home/kavia/workspace/code-generation/api-mock-server-91814/mock_api_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi


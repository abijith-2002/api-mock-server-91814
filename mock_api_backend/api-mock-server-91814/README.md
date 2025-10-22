# Project Repository

This is the initial README file for the project.

## Static Images

- The server exposes image files from the `mock_api_backend/images` directory at the public path `/images`.
- Example: `http://localhost:3001/images/bcs.jpg` should serve the Better Call Saul poster.

If you are accessing through a different host or port, adjust the base accordingly:
- Example deployed URL: `https://<domain-or-ip>:3001/images/bcs.jpg`

All API responses that include `poster` URLs now point to `/images/<filename>` and will automatically include the VS Code proxy prefix when applicable (e.g., `https://<vscode-host>/proxy/3001/images/<filename>`).

## API Docs

Swagger UI is available at `/docs`. The server URL is dynamically adjusted based on the current request.

# Project Repository

This is the initial README file for the project.

## Static Images

- The server exposes image files from the `mock_api_backend/images` directory at the public path `/images`.
- Example: `http://localhost:3001/images/bcs.jpg` should serve the Better Call Saul poster.

If you are accessing through a different host or port, adjust the base accordingly:
- Example deployed URL: `https://<domain-or-ip>:3001/images/bcs.jpg`

All API responses that include `poster` URLs now point to `/images/<filename>` and will automatically include the proxy prefix when applicable (e.g., `https://<vscode-host>/proxy/3001/images/<filename>`).

### Verifying proxy prefix behavior
- Call the family endpoint via the proxy: `https://<host>:3001/api/family`
  - The `poster` URLs should look like: `https://<host>/proxy/3001/images/<file>`
- Direct access (without proxy), e.g., `http://localhost:3001/api/family` should produce `poster` URLs like `http://localhost:3001/images/<file>`.
- Direct access to an image should work: `https://<host>/proxy/3001/images/bcs.jpg` (proxied) or `http://localhost:3001/images/bcs.jpg` (direct).
- You can also hit the self-check endpoint: `https://<host>:3001/__selfcheck/url` to see the detected absolute image URL for a sample image.

## API Docs

Swagger UI is available at `/docs`. The server URL is dynamically adjusted based on the current request.

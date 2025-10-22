# Project Repository

This is the initial README file for the project.

## Static Images

- The server exposes image files from the `mock_api_backend/images` directory at the public path `/images`.
- Example (local): `http://localhost:3001/images/bcs.jpg` should serve the Better Call Saul poster.

If you are accessing through a different host or port, adjust the base accordingly:
- Example deployed URL: `https://<domain-or-ip>:3001/images/bcs.jpg`

### VS Code HTTPS Preview / Proxied environments

When viewed via VS Code remote preview, routes may be prefixed by a proxy path such as `/proxy/3001`. In such cases:

- Swagger UI: `https://<vscode-host>/proxy/3001/docs`
- Static images: `https://<vscode-host>/proxy/3001/images/bcs.jpg`
- Example file that exists: `you.jpg` can be tested at `https://<vscode-host>/proxy/3001/images/you.jpg`

We also provide a temporary debug endpoint to verify static serving resolution:
- `https://<vscode-host>/proxy/3001/__debug/static-check`

This endpoint responds with:
- The resolved filesystem path for images
- Whether the directory exists
- A small listing of files
- Existence checks for a few sample files

Note: The app sets `app.set('trust proxy', true)` and dynamically computes server URLs for Swagger.

All API responses that include `poster` URLs point to `/images/<filename>`.

## API Docs

Swagger UI is available at `/docs`. The server URL is dynamically adjusted based on the current request (including proxy headers if behind a proxy).

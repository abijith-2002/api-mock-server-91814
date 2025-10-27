# Project Repository

This is the initial README file for the project.

## Static Images

- The server exposes image files from the `mock_api_backend/images` directory at the public path `/images`.
- Example direct path: `http://localhost:3001/images/bcs.jpg` should serve the Better Call Saul poster.
- Example proxied path: `https://<host>/proxy/3001/images/bcs.jpg`

If you are accessing through a different host or port, adjust the base accordingly:
- Example deployed URL (proxied): `https://<domain-or-ip>/proxy/3001/images/bcs.jpg`

All API responses that include `poster` URLs now point to `/proxy/3001/images/<filename>` after the origin (e.g., `https://<host>/proxy/3001/images/bcs.jpg`).

## API Docs

Swagger UI is available at `/docs`. The server URL is dynamically adjusted based on the current request.

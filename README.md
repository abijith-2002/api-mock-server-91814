# Project Repository

This is the initial README file for the project.

## Static Images

- The server exposes image files from the `mock_api_backend/images` directory at the public path `/images`.
- Example: `http://localhost:3001/images/bcs.jpg` should serve the Better Call Saul poster.

If you are accessing through a different host or port, adjust the base accordingly:
- Example deployed URL: `https://<domain-or-ip>:3001/images/bcs.jpg`

All API responses that include `poster` URLs now point to `/images/<filename>`.

## Port and Startup Notes
- The app prefers PORT from the environment. If not set, it attempts 3001 and probes upward to find a free port.
- In shared preview environments where port 3001 is already occupied, the process will bind to the first available port.
- Health check: `GET /` → `{ status: "ok", ... }`

## API Docs
- Swagger UI is available at `/docs`. The server URL is dynamically adjusted based on the current request, including proxy prefixes (e.g., `/proxy/3001`).
- Raw OpenAPI JSON is available at `/openapi.json` for tool integration.
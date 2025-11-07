# OTT Mock API – Reference

## Overview
The mock_api_backend provides a set of read-only REST endpoints to power an OTT-style UI. Responses include dynamic absolute URLs for images (and video) that adapt to the incoming request’s host, protocol, and any proxy prefix. No authentication is required.

- Base URL: dynamically determined by the server based on the request. Swagger UI at /docs will point to the correct base.
- Static assets:
  - Images: /images/<filename>
  - Videos: /videos/video.mp4

## Conventions
- Content-Type: application/json for all JSON responses.
- CORS: Enabled for all origins with common methods and headers.
- HTTPS normalization: Poster URLs are normalized to https scheme.
- Error responses:
  - 404 application-level: { "status": "error", "message": "Not Found", "path": "<requested path>" }
  - Endpoint-specific errors use { "error": "<message>" }.

## Health

### GET /
Health check for the service.

- Responses:
  - 200 OK: 
    {
      "status": "ok",
      "message": "Service is healthy",
      "timestamp": "<ISO-8601>",
      "environment": "development"
    }

- Example:
  curl -sS https://<host>/

## Shows

All list endpoints return an array of ShowItem:

ShowItem:
- id (integer)
- name (string)
- poster (string; absolute URL, may include /proxy/<port> in proxied environments)

### GET /api/trending
Returns trending shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/trending

### GET /api/continue_watching
Returns the “continue watching” list.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/continue_watching

### GET /api/action
Returns action shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/action

### GET /api/family
Returns family shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/family

### GET /api/comedy
Returns comedy shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/comedy

### GET /api/horror
Returns horror shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/horror

### GET /api/drama
Returns drama shows.

- 200 OK: [ ShowItem, ... ]
- Example:
  curl -sS https://<host>/api/drama

### GET /api/{category}
Generic category fetcher. Valid categories include trending, action, family, comedy, horror, drama, continue_watching.

- Path params:
  - category (string) – required
- Responses:
  - 200 OK: [ ShowItem, ... ]
  - 404 Not Found: { "error": "Category not found" }
- Example:
  curl -sS https://<host>/api/trending
  curl -sS https://<host>/api/continue_watching

## Show Info

### GET /api/info/{id}
Fetches detailed info for a show.

- Path params:
  - id (string) – required (stable id). Also supports query ?id= as fallback.
- Responses:
  - 200 OK (ShowInfo):
    {
      "id": 1,
      "title": "Better Call Saul",
      "description": "...",
      "seasons": 6,
      "total_episodes": 63
    }
  - 400 Bad Request: { "error": "Missing required id parameter" }
  - 404 Not Found: { "error": "Info not found" }

- Examples:
  curl -sS https://<host>/api/info/1
  curl -sS "https://<host>/api/info?id=1"

## Featured

### GET /api/featured
Returns one random featured item.

- 200 OK:
  {
    "data": {
      "id": 1001,
      "name": "MONSTER: The Ed Gein Story",
      "poster": "https://<host>/images/monster_featured.jpg"
    }
  }
- 500 Internal Server Error:
  { "error": "No featured items available" }

- Example:
  curl -sS https://<host>/api/featured

## Video

### GET /api/play
Returns the absolute URL to the demo video hosted at /videos/video.mp4.

- 200 OK:
  { "url": "https://<host>[/proxy/3001]/videos/video.mp4" }

- Example:
  curl -sS https://<host>/api/play

## Error Formats

- Endpoint business errors:
  { "error": "Category not found" }
  { "error": "Missing required id parameter" }
  { "error": "Info not found" }
  { "error": "No featured items available" }

- App-level 404 (unmatched route):
  {
    "status": "error",
    "message": "Not Found",
    "path": "/unknown"
  }

## Example Payloads

- List item example (no proxy):
  {
    "id": 1,
    "name": "Better Call Saul",
    "poster": "https://example.com/images/bcs.jpg"
  }

- List item example (proxied preview):
  {
    "id": 1,
    "name": "Better Call Saul",
    "poster": "https://host.example.com/proxy/3001/images/bcs.jpg"
  }

- ShowInfo example:
  {
    "id": 10,
    "title": "Stranger Things",
    "description": "When a young boy vanishes...",
    "seasons": 4,
    "total_episodes": 34
  }

## OpenAPI
- Machine-readable spec (YAML) at interfaces/openapi.yaml
- A JSON OpenAPI exists at interfaces/openapi.json for Swagger UI generation.

## Notes
- The server sets trust proxy and inspects the original request path to add a proxy prefix (e.g., /proxy/3001) when generating URLs.
- Image and video static routes are mounted before API routes for stable asset paths.

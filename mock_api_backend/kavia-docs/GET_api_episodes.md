# GET /api/episodes – Seasons and Episodes API

## Overview
This endpoint returns a structured list of seasons and their episodes discovered from the server’s videos directory. Each episode includes absolute URLs for the video source and its thumbnail that are automatically constructed to match the incoming request’s host, protocol, and any proxy prefix. No authentication is required.

- Base path: dynamic (derived from the current request)
- Static assets:
  - Videos: served from /videos
- This document is intended for frontend developers to integrate a season/episode browser and player.

## Method and URL
- Method: GET
- URL: /api/episodes

## Authentication
- None. The endpoint is publicly accessible.

## Request Parameters
- None. This endpoint does not accept query or path parameters.

## Response Format
The endpoint returns HTTP 200 with an array of season objects. Each season object contains a season number, an episode_count, and a list of episodes with absolute URLs.

### JSON Schema
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "season": { "type": "integer" },
      "episode_count": { "type": "integer" },
      "episodes": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "src": {
              "type": "string",
              "description": "Absolute URL to the episode video"
            },
            "thumbnail": {
              "type": "string",
              "description": "Absolute URL to the episode thumbnail"
            },
            "duration": { "type": "string" },
            "name": { "type": "string" }
          },
          "required": ["src", "thumbnail", "duration", "name"]
        }
      }
    },
    "required": ["season", "episode_count", "episodes"]
  }
}
```

### Field Descriptions
- season (integer): The numeric season identifier parsed from the folder name S{n}.
- episode_count (integer): The total number of valid episodes found in this season. Only episodes that include both episode.mp4 and thumbnail.jpg are counted.
- episodes (array): The list of episode entries for the season, sorted by episode number ascending.
  - src (string): Absolute URL to the episode video file episode.mp4.
  - thumbnail (string): Absolute URL to the episode thumbnail image thumbnail.jpg.
  - duration (string): A short human-friendly duration label derived from a metadata map. If an episode is not in the metadata map, the field is present but may be empty.
  - name (string): Episode title from a metadata map. If not found, a fallback like “S{n}E{m}” is used.

## Example Successful Response
Below is an example response when multiple seasons and episodes exist under the videos directory (S1/S2/S3 with E1..). Returned URLs will include a proxy prefix (e.g., /proxy/3001) when the request comes through a preview/proxy environment; otherwise, they will be direct.

```json
[
  {
    "season": 1,
    "episode_count": 3,
    "episodes": [
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S1/E1/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S1/E1/thumbnail.jpg",
        "duration": "5m",
        "name": "Pilot"
      },
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S1/E2/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S1/E2/thumbnail.jpg",
        "duration": "4m",
        "name": "Prison Mike"
      },
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S1/E3/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S1/E3/thumbnail.jpg",
        "duration": "5m",
        "name": "Basketball"
      }
    ]
  },
  {
    "season": 2,
    "episode_count": 2,
    "episodes": [
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S2/E1/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S2/E1/thumbnail.jpg",
        "duration": "4m",
        "name": "Sensitivity Training"
      },
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S2/E2/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S2/E2/thumbnail.jpg",
        "duration": "4m",
        "name": "The Negotiation"
      }
    ]
  },
  {
    "season": 3,
    "episode_count": 2,
    "episodes": [
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S3/E1/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S3/E1/thumbnail.jpg",
        "duration": "2m",
        "name": "Boom! Roasted"
      },
      {
        "src": "https://your-host.example.com/proxy/3001/videos/S3/E2/episode.mp4",
        "thumbnail": "https://your-host.example.com/proxy/3001/videos/S3/E2/thumbnail.jpg",
        "duration": "2m",
        "name": "The Chump"
      }
    ]
  }
]
```

Note: In a direct environment without a proxy, URLs will be like:
- https://your-host.example.com/videos/S1/E1/episode.mp4
- https://your-host.example.com/videos/S1/E1/thumbnail.jpg

## Error Responses
- 200 OK with empty array:
  - When the videos directory is missing or contains no valid season/episode pairs with both files present.
  - Example:
    ```json
    []
    ```
- 500 Internal Server Error:
  - On unexpected scan failures.
  - Example:
    ```json
    {
      "error": "internal-error",
      "message": "descriptive message"
    }
    ```

## Notes on File URL Construction and Availability
- Absolute URLs are created using a shared helper buildAbsoluteUrl(req, path) that:
  - Forces HTTPS scheme.
  - Preserves any proxy prefix (such as /proxy/3001) detected in the request path.
  - Uses the preferred host from the current request (with trust proxy enabled).
- Video and thumbnails are served from the Express static route mounted at /videos, mapped to the repository’s mock_api_backend/videos directory.
- Episodes are discovered only if both episode.mp4 and thumbnail.jpg exist inside videos/S{n}/E{m}/.
- Episode metadata (duration and name) is provided via a small in-memory map for known keys (S1E1…S3E2). Unknown episodes still appear if both files exist, but may have empty duration and fallback name.

## Performance Considerations
- The endpoint scans the filesystem at request time to discover seasons and episodes.
- On typical local/demo datasets this is fast; however, for very large libraries you may consider:
  - Caching the scan results in memory and refreshing periodically.
  - Debouncing the scan when the file tree is stable.
  - Paging or lazy-loading if seasons/episodes grow significantly.
- The current response is sorted by:
  - season ascending (S1, S2, …)
  - episode number ascending within each season.

## Quick Usage
- Fetch:
  - GET https://<host>/api/episodes
- Expected success: HTTP 200 with an array of seasons as described above.
- No headers or tokens required.

## Change History
- Initial version: documents the behavior implemented in routes/episodes.js with HTTPS-normalized absolute URLs and proxy-aware path construction.

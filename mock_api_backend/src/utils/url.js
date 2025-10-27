'use strict';

/**
 * Utility functions to build absolute URLs for poster/image links.
 * New requirement: Always include the fixed proxy segment '/proxy/3001' after the origin,
 * regardless of the incoming request context. Guard against accidental duplication.
 */

/**
 * Build protocol + host string from request, honoring 'trust proxy' to respect X-Forwarded headers.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getOrigin(req) {
  const protocol = req.secure ? 'https' : req.protocol;
  const host = req.get('host'); // may include port
  return `${protocol}://${host}`;
}

/**
 * Ensure the path begins with a single leading slash.
 * @param {string} p
 * @returns {string}
 */
function toPath(p) {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * PUBLIC_INTERFACE
 * Build an absolute URL for a given path, always inserting '/proxy/3001' after the origin.
 * - inputPath should start with a slash (e.g., /images/bcs.jpg), but we normalize if not.
 * - Result example: https://host/proxy/3001/images/bcs.jpg
 * - Guards:
 *   - Does not duplicate '/proxy/3001' if already present at the beginning of the path.
 *   - If inputPath already contains '/proxy/3001' at the start, it will not be added again.
 * @param {import('express').Request} req
 * @param {string} inputPath
 * @returns {string}
 */
function buildAbsoluteUrl(req, inputPath) {
  const origin = getOrigin(req);
  const path = toPath(inputPath);

  const PROXY_SEGMENT = '/proxy/3001';
  // If path already starts with the proxy segment, don't add it again.
  const normalizedPath = path.startsWith(PROXY_SEGMENT)
    ? path
    : `${PROXY_SEGMENT}${path}`;

  return `${origin}${normalizedPath}`;
}

module.exports = {
  getOrigin,
  buildAbsoluteUrl,
};

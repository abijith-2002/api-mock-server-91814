'use strict';

/**
 * Utility functions to build absolute URLs that respect proxy prefixes (e.g., VS Code HTTPS preview /proxy/3001).
 * The helper inspects the incoming request to determine protocol, host, and any proxy prefix found in the URL.
 * Notes:
 * - We rely on req.originalUrl being preserved by Express (ensure middleware order does not rewrite it).
 * - As a fallback, we also scan req.baseUrl and req.url to robustly detect a leading /proxy/:port prefix.
 */

/**
 * Try to extract a proxy prefix from multiple request URL fields.
 * Examples that should be detected:
 *   /proxy/3001/api/family        => /proxy/3001
 *   /proxy/3001/docs              => /proxy/3001
 *   /proxy/3001                   => /proxy/3001
 * Not detected (returns empty string):
 *   /api/family
 * @param {import('express').Request} req
 * @returns {string}
 */
function getProxyPrefix(req) {
  try {
    const candidates = [
      req.originalUrl,
      // baseUrl is the mount point of the router; req.url is the path on that router
      // Concatenate to reconstruct a likely full path when originalUrl isn't helpful.
      (req.baseUrl || '') + (req.url || ''),
      req.baseUrl,
      req.url,
    ].filter(Boolean);

    for (const value of candidates) {
      const m = String(value).match(/^\/proxy\/\d{2,5}(?=\/|$)/i);
      if (m) {
        return m[0];
      }
    }
    return '';
  } catch (_) {
    return '';
  }
}

/**
 * Build protocol + host string from request, honoring trust proxy to respect X-Forwarded headers.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getOrigin(req) {
  // When 'trust proxy' is enabled, req.protocol and req.secure reflect forwarded proto.
  const protocol = req.secure ? 'https' : req.protocol;
  const host = req.get('host'); // may include port
  return `${protocol}://${host}`;
}

/**
 * PUBLIC_INTERFACE
 * Build an absolute URL for a given path, automatically inserting proxy prefix when detected.
 * - inputPath should start with a slash (e.g., /images/bcs.jpg)
 * - Result example (proxied): https://host/proxy/3001/images/bcs.jpg
 * - Result example (direct):  https://host/images/bcs.jpg
 * @param {import('express').Request} req
 * @param {string} inputPath
 * @returns {string}
 */
function buildAbsoluteUrl(req, inputPath) {
  const origin = getOrigin(req);
  const proxyPrefix = getProxyPrefix(req);
  const path = inputPath.startsWith('/') ? inputPath : `/${inputPath}`;
  return `${origin}${proxyPrefix}${path}`;
}

module.exports = {
  getProxyPrefix,
  getOrigin,
  buildAbsoluteUrl,
};

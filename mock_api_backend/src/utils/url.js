'use strict';

/**
 * Utility functions to build absolute URLs that respect proxy prefixes (e.g., VS Code HTTPS preview /proxy/3001).
 * The helper inspects the incoming request to determine protocol, host, and any proxy prefix found in the original URL.
 */

/**
 * Extract a proxy prefix from the request path if present (e.g., /proxy/3001).
 * Returns '' if not proxied.
 * This is heuristic: matches leading /proxy/<port> or /proxy/<port>/... at the start of originalUrl.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getProxyPrefix(req) {
  try {
    const originalUrl = req.originalUrl || '';
    // We only care about a prefix at the start. Examples:
    // /proxy/3001/docs => /proxy/3001
    // /proxy/3001/api/trending => /proxy/3001
    // /api/trending => ''
    const match = originalUrl.match(/^\/proxy\/\d{2,5}(?=\/|$)/i);
    return match ? match[0] : '';
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

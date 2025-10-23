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
 * Determine the preferred host for absolute URL generation.
 * Preference order:
 * - X-Forwarded-Host header (first value if comma-separated)
 * - req.headers.host
 * Then apply deterministic mapping:
 * - If host is an AWS ELB (*.elb.amazonaws.com), rewrite to backend.kavia.app host
 * - If host already matches backend.kavia.app, keep it
 * Always return host possibly including port if appropriate.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getPreferredHost(req) {
  // Prefer x-forwarded-host when present
  const xfh = req.get('x-forwarded-host');
  const rawHost = (xfh ? xfh.split(',')[0].trim() : '') || req.get('host') || '';

  // Known desired backend host
  const desiredHost = 'kavia-alb-9aef674c-1653323432.backend.kavia.app';

  // If it's already our desired host (or subdomain variations), keep it
  if (rawHost.endsWith('.backend.kavia.app')) {
    // Force specifically to desiredHost to avoid mismatches between different aliases
    return desiredHost;
  }

  // If it's an ELB host pattern, rewrite to desiredHost
  const isElb = /\.elb\.amazonaws\.com(?::\d+)?$/i.test(rawHost);
  if (isElb) {
    return desiredHost;
  }

  // Otherwise, return the original host
  return rawHost;
}

/**
 * Build protocol + host string from request, honoring trust proxy to respect X-Forwarded headers.
 * PUBLIC_INTERFACE
 * @param {import('express').Request} req
 * @returns {string}
 */
function getOrigin(req) {
  // Force https scheme for absolute URLs
  const protocol = 'https';
  const host = getPreferredHost(req); // may include port if forwarded
  return `${protocol}://${host}`;
}

/**
 * PUBLIC_INTERFACE
 * Ensure a URL string uses HTTPS scheme. If it starts with http:// it will be rewritten to https://.
 * If it is protocol-relative (//host/path), it will be prefixed with https:.
 * Non-string or empty inputs are returned as-is.
 * @param {string} url
 * @returns {string}
 */
function ensureHttps(url) {
  if (typeof url !== 'string' || url.length === 0) return url;
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return 'https://' + url.slice('http://'.length);
  if (url.startsWith('//')) return 'https:' + url;
  // If it's a relative url, leave it as-is (absolute building handles protocol)
  return url;
}

/**
 * PUBLIC_INTERFACE
 * Build an absolute URL for a given path, automatically inserting proxy prefix when detected.
 * - inputPath should start with a slash (e.g., /images/bcs.jpg)
 * - Result example (proxied): https://host/proxy/3001/images/bcs.jpg
 * - Result example (direct):  https://host/images/bcs.jpg
 * Ensures the final URL uses https scheme.
 * @param {import('express').Request} req
 * @param {string} inputPath
 * @returns {string}
 */
function buildAbsoluteUrl(req, inputPath) {
  const origin = getOrigin(req);
  const proxyPrefix = getProxyPrefix(req);
  const path = inputPath.startsWith('/') ? inputPath : `/${inputPath}`;
  const absolute = `${origin}${proxyPrefix}${path}`;
  // Normalize to https for safety (origin is already https)
  return ensureHttps(absolute);
}

module.exports = {
  getProxyPrefix,
  getOrigin,
  buildAbsoluteUrl,
  ensureHttps,
  // Exported for potential future reuse/testing
  getPreferredHost,
};

'use strict';

const { ensureHttps } = require('./url');

describe('ensureHttps', () => {
  test('leaves https URLs unchanged', () => {
    expect(ensureHttps('https://example.com/path')).toBe('https://example.com/path');
  });

  test('rewrites http to https', () => {
    expect(ensureHttps('http://example.com/a')).toBe('https://example.com/a');
  });

  test('prefixes protocol-relative with https', () => {
    expect(ensureHttps('//example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  test('returns non-strings unchanged', () => {
    expect(ensureHttps(null)).toBe(null);
    expect(ensureHttps(undefined)).toBe(undefined);
  });

  test('leaves relative paths unchanged', () => {
    expect(ensureHttps('/images/a.jpg')).toBe('/images/a.jpg');
    expect(ensureHttps('images/a.jpg')).toBe('images/a.jpg');
  });
});

import { describe, it, expect } from 'vitest';

// Pure utility implementations (mirroring portfolio-uiux logic)
const slug = (s = ''): string =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const splitList = (v: any): string[] =>
  (Array.isArray(v) ? v : String(v || ''))
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

const figmaToEmbed = (url?: string): string =>
  url ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}` : '';

describe('utils', () => {
  it('slugifies strings', () => {
    expect(slug('Design System')).toBe('design-system');
    expect(slug('  Hello, World! ')).toBe('hello-world');
  });

  it('splits list by comma or pipe', () => {
    expect(splitList('a,b, c')).toEqual(['a', 'b', 'c']);
    expect(splitList('x| y |z')).toEqual(['x', 'y', 'z']);
  });

  it('converts figma url to embed', () => {
    const src = 'https://www.figma.com/proto/abc?node-id=1-2';
    expect(figmaToEmbed(src)).toContain('https://www.figma.com/embed?embed_host=share&url=');
    expect(figmaToEmbed(undefined)).toBe('');
  });
});

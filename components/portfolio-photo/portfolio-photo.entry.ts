import { createApp } from 'vue';
import PhotographyGallery, { PhotoItem } from './PhotographyGallery';

function toArray<T>(list: NodeListOf<T> | HTMLCollectionOf<T>): T[] {
  return Array.prototype.slice.call(list);
}

function slug(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseFromJson(el: HTMLElement): PhotoItem[] {
  const script = el.querySelector('#photos-json[type="application/json"]') as HTMLScriptElement | null;
  if (!script) return [];
  try {
    const raw = JSON.parse(script.textContent || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map((it: any, idx: number) => normalizeItem(it, idx));
  } catch {
    return [];
  }
}

function parseFromHtml(el: HTMLElement): PhotoItem[] {
  const dataList = el.querySelector('#photos-data');
  if (!dataList) return [];
  const items = toArray(dataList.querySelectorAll('li')) as HTMLElement[];
  return items.map((li, idx) => {
    const title = li.getAttribute('data-title') || '';
    const obj: any = {
      id: li.getAttribute('data-id') || '',
      title,
      description: li.getAttribute('data-description') || '',
      categories: (li.getAttribute('data-categories') || '').split(',').map((s) => s.trim()).filter(Boolean),
      year: Number(li.getAttribute('data-year') || new Date().getFullYear()),
      afterSrc: li.getAttribute('data-after-src') || li.getAttribute('data-src') || '',
      beforeSrc: li.getAttribute('data-before-src') || undefined,
      thumb: li.getAttribute('data-thumb') || undefined,
      alt: li.getAttribute('data-alt') || title || '',
      accent: li.getAttribute('data-accent') || null,
    };
    return normalizeItem(obj, idx);
  });
}

function normalizeItem(it: any, idx: number): PhotoItem {
  const title = String(it.title || '').trim();
  const id = String(it.id || slug(title) || `photo-${idx + 1}`);
  const categories = Array.isArray(it.categories)
    ? it.categories
    : String(it.categories || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
  const year = Number(it.year || new Date().getFullYear());
  const afterSrc = String(it.afterSrc || it.src || '');
  const beforeSrc = it.beforeSrc ? String(it.beforeSrc) : undefined;
  const thumb = it.thumb ? String(it.thumb) : undefined;
  const alt = String(it.alt || title || id);
  const accent = it.accent != null ? String(it.accent) : null;
  return { id, title, description: String(it.description || ''), categories, year, afterSrc, beforeSrc, thumb, alt, accent };
}

function coerceExternalData(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.photos)) return raw.photos;
  return [];
}

async function mountInto(container: HTMLElement) {
  // Mount onto the section if present; otherwise on container itself
  const section = (container.querySelector('#portfolio-photo') as HTMLElement | null) || container;
  const inline = parseFromJson(section).concat(parseFromHtml(section));

  // External JSON via data-src (supports array root or { photos: [] })
  const srcAttr = section.getAttribute('data-src') || container.getAttribute('data-src') || '';
  let remote: PhotoItem[] = [];
  if (srcAttr) {
    try {
      const res = await fetch(srcAttr, { credentials: 'omit' });
      if (res.ok) {
        const raw = await res.json();
        remote = coerceExternalData(raw).map((it: any, idx: number) => normalizeItem(it, idx));
      }
    } catch {
      // ignore fetch errors; fall back to inline
    }
  }

  const uniqueById = new Map<string, PhotoItem>();
  [...inline, ...remote].forEach((it) => uniqueById.set(it.id, it));
  const deduped = Array.from(uniqueById.values());

  const app = createApp(PhotographyGallery, { items: deduped });
  app.mount(section);
}

function mountAll() {
  document.querySelectorAll('[data-component="portfolio-photo"]').forEach((el) => mountInto(el as HTMLElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}

document.addEventListener('componentLoaded' as any, (e: Event) => {
  const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
  const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
  if (base !== 'portfolio-photo') return;
  if (evt.detail?.target) mountInto(evt.detail.target);
});



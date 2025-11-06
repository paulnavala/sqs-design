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
  if (!script) {
    console.debug('[portfolio-photo] No #photos-json script found');
    return [];
  }
  try {
    const raw = JSON.parse(script.textContent || '[]');
    if (!Array.isArray(raw)) {
      console.warn('[portfolio-photo] JSON is not an array:', raw);
      return [];
    }
    const items = raw.map((it: any, idx: number) => normalizeItem(it, idx));
    console.debug(`[portfolio-photo] Parsed ${items.length} items from inline JSON`);
    return items;
  } catch (err) {
    console.error('[portfolio-photo] Failed to parse JSON:', err);
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
  
  console.log('[portfolio-photo] mountInto called', { 
    hasSection: !!section, 
    sectionId: section?.id,
    dataSrc: section?.getAttribute('data-src') || container.getAttribute('data-src')
  });
  
  // Check if already mounted via explicit flag
  const mountedFlag = (section as any)._pgMounted || section.hasAttribute('data-pg-mounted');
  if (mountedFlag) {
    console.warn('[portfolio-photo] Already mounted (flag), skipping');
    return;
  }

  // Read inline data (JSON + HTML) before any DOM cleanup
  const inline = parseFromJson(section).concat(parseFromHtml(section));
  console.log('[portfolio-photo] Inline items:', inline.length);

  // External JSON via data-src (supports array root or { photos: [] })
  const srcAttr = section.getAttribute('data-src') || container.getAttribute('data-src') || '';
  console.log('[portfolio-photo] Fetching from:', srcAttr || '(no data-src)');
  let remote: PhotoItem[] = [];
  if (srcAttr) {
    try {
      console.log('[portfolio-photo] Fetching JSON...');
      const res = await fetch(srcAttr, { credentials: 'omit' });
      console.log('[portfolio-photo] Fetch response:', res.status, res.ok);
      if (res.ok) {
        const raw = await res.json();
        console.log('[portfolio-photo] Raw JSON:', raw);
        remote = coerceExternalData(raw).map((it: any, idx: number) => normalizeItem(it, idx));
        console.log('[portfolio-photo] Parsed remote items:', remote.length, remote);
      } else {
        console.error('[portfolio-photo] Fetch failed with status:', res.status);
      }
    } catch (err) {
      console.error('[portfolio-photo] Failed to fetch external JSON:', err);
      // ignore fetch errors; fall back to inline
    }
  }

  const uniqueById = new Map<string, PhotoItem>();
  [...inline, ...remote].forEach((it) => uniqueById.set(it.id, it));
  const deduped = Array.from(uniqueById.values());

  console.log('[portfolio-photo] Final items count:', deduped.length, deduped);

  // If loader HTML header exists, clear it now (post data read) so Vue can render cleanly
  const existingVueRoot = section.querySelector('.pg__header');
  if (existingVueRoot) {
    console.log('[portfolio-photo] Clearing loader HTML before Vue mount');
    section.innerHTML = '';
  }

  if (deduped.length === 0) {
    console.warn('[portfolio-photo] No photos found. Check JSON data or data-src attribute.');
    // Show a message in the DOM
    if (section) {
      section.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">No photos found. Check console for details.</div>';
    }
    return;
  }

  console.log(`[portfolio-photo] Mounting Vue app with ${deduped.length} photos`);
  const app = createApp(PhotographyGallery, { items: deduped });
  app.mount(section);
  try {
    (section as any)._pgMounted = true;
    section.setAttribute('data-pg-mounted', '1');
  } catch {}
  console.log('[portfolio-photo] Vue app mounted successfully');
}

function mountAll() {
  document.querySelectorAll('[data-component="portfolio-photo"]').forEach((el) => {
    const target = el as HTMLElement;
    const tryMount = () => mountInto(target);

    // If loader HTML is already present, mount immediately
    if (target.querySelector('#portfolio-photo')) {
      console.log('[portfolio-photo] Section found immediately, mounting');
      tryMount();
      return;
    }

    // Otherwise, observe for injected loader HTML
    console.log('[portfolio-photo] Waiting for loader HTML via MutationObserver');
    const obs = new MutationObserver(() => {
      if (target.querySelector('#portfolio-photo')) {
        obs.disconnect();
        console.log('[portfolio-photo] Section detected by observer, mounting');
        tryMount();
      }
    });
    obs.observe(target, { childList: true, subtree: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}

document.addEventListener('componentLoaded' as any, (e: Event) => {
  const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
  const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
  console.log('[portfolio-photo] componentLoaded event:', base, evt.detail);
  if (base !== 'portfolio-photo') return;
  if (evt.detail?.target) {
    console.log('[portfolio-photo] Mounting from componentLoaded event');
    mountInto(evt.detail.target);
  }
});



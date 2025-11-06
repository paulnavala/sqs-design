import { createApp } from 'vue';
import ProjectCards from './ProjectCards';

function parseItemsFrom(el: HTMLElement): any[] {
  const script = el.querySelector('script[type="application/json"][data-items]') as HTMLScriptElement | null;
  if (!script) return [];
  try {
    return JSON.parse(script.textContent || '[]');
  } catch {
    return [];
  }
}

function mountInto(el: HTMLElement) {
  const items = parseItemsFrom(el);
  const app = createApp(ProjectCards, { items });
  app.mount(el);
}

function mountAll() {
  document.querySelectorAll('[data-component="project-cards"]').forEach((el) => mountInto(el as HTMLElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}

document.addEventListener('componentLoaded' as any, (e: Event) => {
  const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
  const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
  if (base !== 'project-cards') return;
  if (evt.detail?.target) mountInto(evt.detail.target);
});



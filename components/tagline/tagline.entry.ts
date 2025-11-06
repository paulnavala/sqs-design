import { createApp } from 'vue';
import Tagline from './TaglineComponent';

function resolveProps(el: HTMLElement) {
  const t1 = el.getAttribute('data-line1') || undefined;
  const t2 = el.getAttribute('data-line2') || undefined;
  const cfg = el.querySelector('[data-line1], [data-line2]') as HTMLElement | null;
  return {
    line1: t1 ?? (cfg?.getAttribute('data-line1') || undefined),
    line2: t2 ?? (cfg?.getAttribute('data-line2') || undefined),
  };
}

function mountInto(el: HTMLElement) {
  const props = resolveProps(el);
  const app = createApp(Tagline, props);
  app.mount(el);
}

function mountAll() {
  document.querySelectorAll('[data-component="tagline"]').forEach((el) => mountInto(el as HTMLElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}

document.addEventListener('componentLoaded' as any, (e: Event) => {
  const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
  const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
  if (base !== 'tagline') return;
  if (evt.detail?.target) mountInto(evt.detail.target);
});



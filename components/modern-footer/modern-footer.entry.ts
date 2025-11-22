import { createApp } from 'vue';
import ModernFooter from './ModernFooter';
import './modern-footer.css';

function initModernFooter(rootEl?: HTMLElement | null) {
  const root = rootEl || document.getElementById('modern-footer-root');
  if (!root) return;

  // Prevent double mounting
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';

  createApp(ModernFooter).mount(root);
}

// Expose global init function
// @ts-ignore
window.initModernFooter = () => initModernFooter();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initModernFooter());
} else {
  initModernFooter();
}

// Listen for dynamic loading (local dev or Squarespace)
document.addEventListener('componentLoaded' as any, (e: Event) => {
  const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
  const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
  if (base === 'modern-footer') {
    const target = evt.detail?.target;
    const specificRoot = target ? target.querySelector('#modern-footer-root') : null;
    initModernFooter(specificRoot as HTMLElement);
  }
});

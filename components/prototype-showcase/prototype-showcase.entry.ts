import { createApp } from 'vue';
import { mountOnLoader } from '../_shared/mount';
import PrototypeShowcase from './PrototypeShowcase';

mountOnLoader('prototype-showcase', (el) => {
  const app = createApp(PrototypeShowcase, {
    figmaUrl: el.getAttribute('data-figma') || '',
    title: el.getAttribute('data-title') || 'Prototype',
  });
  app.mount(el);
});



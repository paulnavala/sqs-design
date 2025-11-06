import { createApp } from 'vue';
import { mountOnLoader } from '../_shared/mount';
import MobileMenu from './MobileMenu';

mountOnLoader('mobile-menu', (el) => {
  const app = createApp(MobileMenu);
  app.mount(el);
});



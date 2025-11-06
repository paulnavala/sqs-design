import { createApp } from 'vue';
import { mountOnLoader } from '../_shared/mount';
import Tagline from './TaglineComponent';

mountOnLoader('tagline', (el) => {
  // Prefer attributes on the target; otherwise read from injected loader content
  const fromTarget1 = el.getAttribute('data-line1') || undefined;
  const fromTarget2 = el.getAttribute('data-line2') || undefined;
  const cfg = el.querySelector('[data-line1], [data-line2]') as HTMLElement | null;
  const fromInner1 = cfg?.getAttribute('data-line1') || undefined;
  const fromInner2 = cfg?.getAttribute('data-line2') || undefined;

  const app = createApp(Tagline, {
    line1: fromTarget1 ?? fromInner1,
    line2: fromTarget2 ?? fromInner2,
  });
  app.mount(el);
});



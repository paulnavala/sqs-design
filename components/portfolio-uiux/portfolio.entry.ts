import './portfolio-uiux.css';
import { waitFor, qs, qsa, isVisible, trapFocus } from '../_shared/dom';

// IDs and selectors
const SECTION_ID = 'portfolio-uiux';
const SECTION_TIMEOUT = 8000;
const FOCUSABLE_SELECTOR =
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Data structure for a portfolio project. */
type Project = {
  id: string;
  title: string;
  description: string;
  figmaUrl: string;
  caseStudyHref: string;
  badges: string[];
  categories: string[];
  year: number;
  accent: string | null;
};

const slug = (s = ''): string =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const figmaToEmbed = (url?: string): string =>
  url ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}` : '';
const splitList = (v: any): string[] =>
  (Array.isArray(v) ? v : String(v || ''))
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

['mercury:load', 'sqs:pageLoaded', 'DOMContentLoaded'].forEach((evt) =>
  document.addEventListener(evt, initOnce as any)
);
window.addEventListener('load', initOnce);

async function initOnce(): Promise<void> {
  const root = (await waitFor('#' + SECTION_ID, SECTION_TIMEOUT).catch(
    () => null
  )) as HTMLElement | null;
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';

  const list = root.querySelector('#projects-list') as HTMLElement | null;
  const tpl = root.querySelector('#project-card-template') as HTMLTemplateElement | null;
  const countEl = root.querySelector('[data-count]') as HTMLElement | null;
  const pills = root.querySelector('.portfolio__filters') as HTMLElement | null;

  let modal = root.querySelector('#portfolio-modal') as HTMLElement | null;
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'portfolio-modal';
    modal.id = 'portfolio-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'portfolio-modal-title');
    (modal as any).hidden = true;
    modal.innerHTML = `
      <div class="portfolio-modal__backdrop" data-close></div>
      <div class="portfolio-modal__dialog" role="document">
        <header class="portfolio-modal__header">
          <h3 id="portfolio-modal-title" class="portfolio-modal__title"></h3>
          <div class="portfolio-modal__actions">
            <a class="portfolio-modal__open" href="#" target="_blank" rel="noopener">Open in new tab</a>
            <button class="portfolio-modal__close" type="button" aria-label="Close fullscreen" data-close>✕</button>
          </div>
        </header>
        <div class="portfolio-modal__body">
          <div class="portfolio-modal__frame">
            <div class="portfolio-modal__spinner" aria-hidden="true"></div>
            <iframe class="portfolio-modal__iframe" title="Project (fullscreen)" loading="lazy" allow="fullscreen; clipboard-write" allowfullscreen></iframe>
          </div>
        </div>
        <p class="portfolio-modal__fallback" hidden>
          Couldn't load the embedded prototype.
          <a class="portfolio-modal__open" href="#" target="_blank" rel="noopener">Open in a new tab</a>.
        </p>
      </div>`;
    root.appendChild(modal);
  }

  const iframe = modal!.querySelector('.portfolio-modal__iframe') as HTMLIFrameElement | null;
  const titleEl = modal!.querySelector('.portfolio-modal__title') as HTMLElement | null;
  const openLink = modal!.querySelector('.portfolio-modal__open') as HTMLAnchorElement | null;
  const backdrop = modal!.querySelector('.portfolio-modal__backdrop') as HTMLElement | null;
  const closeBtns = modal!.querySelectorAll('[data-close]');

  /** Read projects from hidden data list injected by loader. */
  function readDataItems(): Project[] {
    const bag = root!.querySelector('#projects-data');
    if (!bag) return [] as any[];
    return Array.from(bag.querySelectorAll('li')).map((li: any) => ({
      id: li.dataset.id || '',
      title: li.dataset.title || 'Untitled Project',
      description: li.dataset.description || '',
      figmaUrl: li.dataset.figma || '',
      caseStudyHref: li.dataset.case || '#',
      badges: splitList(li.dataset.badges),
      categories: splitList(li.dataset.categories),
      year: Number(li.dataset.year) || new Date().getFullYear(),
      accent: li.dataset.accent || null,
    })) as Project[];
  }

  // Lazily load iframe sources slightly before entering viewport
  const iframeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const frame = e.target as HTMLIFrameElement;
        const dataSrc = frame.getAttribute('data-src');
        if (dataSrc && !(frame as any).src) {
          (frame as any).src = dataSrc;
        }
        iframeObserver.unobserve(frame);
      });
    },
    { rootMargin: '300px 0px', threshold: 0.1 }
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        (e.target as HTMLElement).classList.toggle('is-inview', e.isIntersecting);
        if (e.isIntersecting) revealObserver.unobserve(e.target);
      });
    },
    { rootMargin: '100px 0px', threshold: 0.2 }
  );

  /** Render project cards from the template into the list. */
  function render(projects: Project[]) {
    if (!tpl || !list) return;
    list.innerHTML = '';
    const frag = document.createDocumentFragment();
    projects.forEach((p) => {
      const node = (tpl as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment;
      const section = qs('.project', node)!;
      const title = qs('.project__title', node)!;
      const sub = qs('.project__sub', node)!;
      const badgeEl = qs('.badge', node)!;
      const capName = qs('.project__cap-name', node)!;
      const yearEl = qs('.project__year', node)!;
      const caseA = qs('[data-internal-link]', node) as HTMLAnchorElement | null;
      const frame = qs('.project__iframe', node) as HTMLIFrameElement | null;

      title.textContent = p.title;
      sub.textContent = p.description || '';
      badgeEl.textContent = (p.badges || []).join(' • ');
      capName.textContent = p.title;
      yearEl.textContent = String(p.year);
      if (caseA && p.caseStudyHref) caseA.href = p.caseStudyHref;
      if (p.accent) (section as HTMLElement).style.setProperty('--accent', p.accent);
      (section as any).dataset.categories = (p.categories || []).map(slug).join(' ');
      if (frame) {
        frame.setAttribute('data-src', figmaToEmbed(p.figmaUrl));
        frame.title = `${p.title} (interactive Figma)`;
        iframeObserver.observe(frame);
      }
      revealObserver.observe(section);
      section.setAttribute('aria-label', p.title);
      frag.appendChild(node);
    });
    list.appendChild(frag);
    updateCount();
  }

  /** Update visible project count (after filtering or initial render). */
  function updateCount() {
    if (!countEl) return;
    const total = qsa('.project', list!).filter(
      (el) => (el as HTMLElement).style.display !== 'none'
    ).length;
    countEl.textContent = String(total);
  }

  /** Toggle active pill button state. */
  function setActivePill(v: string) {
    if (!pills) return;
    qsa('.pill', pills).forEach((btn: any) => {
      const isActive = btn.dataset.filter === v || (v === 'all' && btn.dataset.filter === 'all');
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  /** Apply filter to projects and refresh count. */
  function applyFilter(v: string) {
    const val = slug(v || 'all');
    qsa('.project', list!).forEach((card: any) => {
      if (val === 'all') {
        card.style.display = '';
      } else {
        const cats = (card.dataset.categories || '').split(' ');
        card.style.display = cats.includes(val) ? '' : 'none';
      }
    });
    setActivePill(val);
    updateCount();
  }

  if (pills) {
    pills.addEventListener('click', (e: any) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      applyFilter(btn.dataset.filter || 'all');
    });
  }

  let lastTrigger: HTMLElement | null = null;

  let releaseTrap: null | (() => void) = null;

  function getCardDataFromTrigger(el: Element) {
    const card = el.closest('.project');
    if (!card) return {} as any;
    const title = card.querySelector('.project__title')?.textContent?.trim() || 'Prototype';
    const f = card.querySelector('.project__iframe') as HTMLIFrameElement | null;
    const src = f?.getAttribute('data-src') || f?.getAttribute('src') || '';
    return { title, src };
  }

  /** Open the fullscreen modal from a trigger within a project card. */
  function openModalFrom(trigger: HTMLElement) {
    const refs = { titleEl, openLink, iframe };
    if (!refs.titleEl || !refs.openLink || !refs.iframe) return;
    const { title, src } = getCardDataFromTrigger(trigger);
    if (!src) return;
    titleEl!.textContent = title;
    openLink!.href = src;
    modal!.classList.add('is-loading');
    (modal as any).hidden = false;
    document.documentElement.classList.add('no-scroll');
    root!.classList.add('no-scroll');
    (iframe as any).src = src;
    const onLoad = () => {
      modal!.classList.remove('is-loading');
      iframe!.removeEventListener('load', onLoad);
    };
    iframe!.addEventListener('load', onLoad);
    setTimeout(() => modal!.classList.remove('is-loading'), 6000);
    lastTrigger = trigger;
    releaseTrap = trapFocus(modal!, FOCUSABLE_SELECTOR);
    modal!.querySelector('.portfolio-modal__close')?.focus();
  }

  /** Close the fullscreen modal and restore focus. */
  function closeModal() {
    (modal as any).hidden = true;
    modal!.classList.remove('is-loading');
    if (iframe) (iframe as any).src = 'about:blank';
    document.documentElement.classList.remove('no-scroll');
    root!.classList.remove('no-scroll');
    if (releaseTrap) {
      releaseTrap();
      releaseTrap = null;
    }
    if (lastTrigger && document.body.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  root.addEventListener('click', (e: any) => {
    const op = e.target.closest('[data-action="open-modal"]');
    if (op) {
      e.preventDefault();
      openModalFrom(op);
    }
  });
  backdrop?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });
  closeBtns.forEach((b) => (b as HTMLElement).addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (!(modal as any).hidden && e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  });

  const projects = readDataItems();
  if (!projects.length) {
    console.warn('[portfolio-uiux] No #projects-data found — rendering seed items.');
    const seed = [
      {
        id: 'cern-01',
        title: 'CERN Prototype',
        description: "An interactive exploration of interface systems for CERN's design evolution.",
        figmaUrl:
          'https://www.figma.com/proto/OUowEnozqwEO4wIcu5qcxh/CERN?node-id=1-105&page-id=0%3A1&starting-point-node-id=1%3A105&scaling=scale-down-width&show-proto-sidebar=0',
        caseStudyHref: '/projects/cern',
        badges: ['Prototype', 'Figma'],
        categories: ['prototype', 'cern'],
        year: new Date().getFullYear(),
        accent: null,
      },
    ];
    render(seed);
  } else {
    render(projects);
  }
  applyFilter('all');
}

// Optional global init for manual triggers (parity); not used by loaders today
// @ts-ignore
window.initPortfolioUIUX = initOnce;

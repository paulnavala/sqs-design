/**
 * Auto-mount helper for Squarespace component loader integration.
 *
 * Mounts a Vue app into any element with matching data-component
 * when the loader injects HTML (via the global `componentLoaded` event),
 * and also mounts immediately for any pre-existing targets in the DOM.
 */

export type MountHandler = (el: HTMLElement) => void;

function toBaseName(fileName: string): string {
  return fileName.replace(/-loader\.html$/i, '').replace(/\.html$/i, '');
}

/**
 * Mount into targets created by the loader and existing DOM.
 * - componentKey: the value used in `data-component="<componentKey>"`
 */
export function mountOnLoader(componentKey: string, mountHandler: MountHandler): void {
  const mounted = new WeakSet<HTMLElement>();

  function tryMount(el: Element | null | undefined) {
    if (!el || !(el instanceof HTMLElement)) return;
    if (mounted.has(el)) return;
    mounted.add(el);
    mountHandler(el);
  }

  function scanAndMount() {
    const nodes = document.querySelectorAll(`[data-component="${componentKey}"]`);
    nodes.forEach((n) => tryMount(n as HTMLElement));
  }

  // Mount for existing DOM (in case loader already ran)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndMount, { once: true });
  } else {
    scanAndMount();
  }

  // Mount when the global component loader injects content
  document.addEventListener('componentLoaded' as any, (e: Event) => {
    const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
    const name = toBaseName(String(evt.detail?.componentName || ''));
    if (name !== componentKey) return;
    tryMount(evt.detail?.target);
  });

  // Rescan on Squarespace navigation events
  ['mercury:load', 'sqs:pageLoaded'].forEach((evt) =>
    document.addEventListener(evt, () => scanAndMount())
  );
}



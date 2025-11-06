import { defineComponent, h, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Tagline',
  props: {
    line1: { type: String, default: 'Every pixel tells a story.' },
    line2: { type: String, default: ' Let the world know yours.' },
    typeSpeed: { type: Number, default: 65 },
    typeVariance: { type: Number, default: 25 },
    waitBetweenLines: { type: Number, default: 2000 },
    holdAfterLine2: { type: Number, default: 15000 },
    fadeDuration: { type: Number, default: 2500 },
    waitBeforeRestart: { type: Number, default: 5000 },
    fixedCenter: { type: Boolean, default: false },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const line1Ref = ref<HTMLElement | null>(null);
    const line2Ref = ref<HTMLElement | null>(null);
    const caret1Ref = ref<HTMLElement | null>(null);
    const caret2Ref = ref<HTMLElement | null>(null);

    function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

    function makeCharSpan(ch: string): HTMLSpanElement {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animation = 'glow 0.6s ease';
      return span;
    }

    function clearPreviousGlow(textEl: HTMLElement) {
      const last = textEl.lastElementChild as HTMLElement | null;
      if (last) {
        last.style.animation = 'none';
        last.style.textShadow = 'none';
      }
    }

    function ensurePlaceholder(lineEl: HTMLElement): HTMLElement {
      let ph = lineEl.querySelector('.caret-placeholder') as HTMLElement | null;
      if (!ph) {
        ph = document.createElement('span');
        ph.className = 'caret-placeholder';
        lineEl.appendChild(ph);
      }
      return ph;
    }

    function measureLineSize(text: string): { width: number; height: number } {
      // Create a hidden measurement container that mimics the line styling
      const measureRoot = document.createElement('div');
      measureRoot.className = 'tagline typewriter';
      measureRoot.style.position = 'absolute';
      measureRoot.style.visibility = 'hidden';
      measureRoot.style.whiteSpace = 'nowrap';
      measureRoot.style.left = '-99999px';
      measureRoot.style.top = '0';

      const line = document.createElement('div');
      line.className = 'text line';
      // Add full text as a span to get exact width with same font
      const span = document.createElement('span');
      span.textContent = text;
      line.appendChild(span);
      // Add placeholder to include caret width in measurement
      const ph = document.createElement('span');
      ph.className = 'caret-placeholder';
      line.appendChild(ph);

      measureRoot.appendChild(line);
      document.body.appendChild(measureRoot);
      const rect = line.getBoundingClientRect();
      const w = Math.ceil(rect.width);
      const h = Math.ceil(rect.height);
      document.body.removeChild(measureRoot);
      return { width: w, height: h };
    }

    function buildSlots(lineEl: HTMLElement, text: string): HTMLElement[] {
      // Clear and build invisible slots for each character to pin final layout
      lineEl.innerHTML = '';
      const slots: HTMLElement[] = [];
      for (let i = 0; i < text.length; i++) {
        const slot = document.createElement('span');
        slot.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        // Reserve width without showing yet
        slot.style.visibility = 'hidden';
        slot.className = 'slot';
        slots.push(slot);
        lineEl.appendChild(slot);
      }
      ensurePlaceholder(lineEl);
      return slots;
    }

    function nextFrame(): Promise<void> {
      return new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }

    function positionCaretAbs(lineEl: HTMLElement, caretEl: HTMLElement, afterSlot: HTMLElement | null) {
      caretEl.classList.add('caret--abs');
      const H_GAP = -1; // slight overlap to sit flush with glyph edge
      const V_ADJUST = 0; // baseline alignment; adjust if needed by font
      if (afterSlot) {
        const left = afterSlot.offsetLeft + afterSlot.offsetWidth + H_GAP;
        const top = afterSlot.offsetTop + V_ADJUST;
        caretEl.style.left = left + 'px';
        caretEl.style.top = top + 'px';
      } else {
        const first = lineEl.querySelector('.slot') as HTMLElement | null;
        if (first) {
          const left = first.offsetLeft;
          const top = first.offsetTop + V_ADJUST;
          caretEl.style.left = left + 'px';
          caretEl.style.top = top + 'px';
        } else {
          caretEl.style.left = '0px';
          caretEl.style.top = '0px';
        }
      }
    }

    async function typeText(text: string, baseSpeed: number, textEl: HTMLElement, activeCaret: HTMLElement | null) {
      const placeholder = ensurePlaceholder(textEl);
      for (let i = 0; i < text.length; i++) {
        clearPreviousGlow(textEl);
        const span = makeCharSpan(text[i]);
        // Insert the new character just before the placeholder
        textEl.insertBefore(span, placeholder);
        // Place the active caret immediately after the new character (before placeholder)
        if (activeCaret) {
          activeCaret.style.visibility = 'visible';
          textEl.insertBefore(activeCaret, placeholder);
        }
        const variance = Math.random() * props.typeVariance - props.typeVariance / 2;
        const delay = Math.max(20, baseSpeed + variance);
        await sleep(delay);
      }
      clearPreviousGlow(textEl);
    }

    function resetTagline(tag: HTMLElement, line1El: HTMLElement) {
      tag.classList.remove('fade');
      line1El.innerHTML = '';
      if (line2Ref.value) line2Ref.value.innerHTML = '';
      // Prepare placeholders
      const ph1 = ensurePlaceholder(line1El);
      if (line2Ref.value) ensurePlaceholder(line2Ref.value);
      // Initialize dual carets
      if (caret1Ref.value) {
        caret1Ref.value.style.visibility = 'visible';
        caret1Ref.value.style.display = 'inline-block';
        caret1Ref.value.style.opacity = '1';
        caret1Ref.value.classList.remove('exit', 'fade-in');
        line1El.insertBefore(caret1Ref.value, ph1);
      }
      if (caret2Ref.value) {
        caret2Ref.value.style.visibility = 'hidden';
      }
    }

    function hideCarets() {
      if (caret1Ref.value) {
        caret1Ref.value.style.visibility = 'hidden';
      }
      if (caret2Ref.value) {
        caret2Ref.value.style.visibility = 'hidden';
      }
    }

    async function runSequence(tag: HTMLElement, line1El: HTMLElement) {
      while (true) {
        const l1 = line1El;
        const l2 = line2Ref.value as HTMLElement | null;
        // Optionally fix line widths to final size to prevent lateral motion
        // Pre-measure final sizes to reserve space and avoid vertical/horizontal shifts
        const s1 = measureLineSize(String(props.line1));
        const s2 = l2 ? measureLineSize(String(props.line2)) : { width: 0, height: 0 };

        // Always reserve vertical space to avoid line jumping
        l1.style.minHeight = s1.height + 'px';
        if (l2) l2.style.minHeight = s2.height + 'px';

        // Optionally fix widths (no lateral motion)
        if (props.fixedCenter) {
          l1.style.width = s1.width + 'px';
          if (l2) l2.style.width = s2.width + 'px';
        } else {
          l1.style.removeProperty('width');
          if (l2) l2.style.removeProperty('width');
        }

        resetTagline(tag, l1);
        if (props.fixedCenter) {
          const slots1 = buildSlots(l1, String(props.line1));
          // Attach absolute caret to the line container
          if (caret1Ref.value) {
            l1.appendChild(caret1Ref.value);
            caret1Ref.value.style.visibility = 'visible';
            positionCaretAbs(l1, caret1Ref.value, null);
          }
          for (let i = 0; i < slots1.length; i++) {
            const slot = slots1[i];
            slot.style.visibility = 'visible';
            slot.style.animation = 'glow 0.6s ease';
            // Move caret after this revealed slot without altering inline flow
            if (caret1Ref.value) {
              await nextFrame();
              positionCaretAbs(l1, caret1Ref.value, slot);
            }
            const variance = Math.random() * props.typeVariance - props.typeVariance / 2;
            const delay = Math.max(20, props.typeSpeed + variance);
            await sleep(delay);
          }
        } else {
          await typeText(String(props.line1), props.typeSpeed, l1, caret1Ref.value || null);
        }
        await sleep(props.waitBetweenLines);
        if (l2) {
          // Switch caret visibility to line 2 and type
          if (caret1Ref.value) caret1Ref.value.style.visibility = 'hidden';
          if (caret2Ref.value) {
            caret2Ref.value.style.visibility = 'visible';
            if (props.fixedCenter) {
              // Attach absolute caret to line 2 container
              l2.appendChild(caret2Ref.value);
              positionCaretAbs(l2, caret2Ref.value, null);
            } else {
              const ph2 = ensurePlaceholder(l2);
              l2.insertBefore(caret2Ref.value, ph2);
            }
          }
          if (props.fixedCenter) {
            const slots2 = buildSlots(l2, String(props.line2));
            for (let i = 0; i < slots2.length; i++) {
              const slot = slots2[i];
              slot.style.visibility = 'visible';
              slot.style.animation = 'glow 0.6s ease';
              if (caret2Ref.value) {
                await nextFrame();
                positionCaretAbs(l2, caret2Ref.value, slot);
              }
              const variance = Math.random() * props.typeVariance - props.typeVariance / 2;
              const delay = Math.max(20, props.typeSpeed + variance);
              await sleep(delay);
            }
          } else {
            await typeText(String(props.line2), props.typeSpeed, l2, caret2Ref.value || null);
          }
        }
        hideCarets();
        await sleep(props.holdAfterLine2);
        tag.classList.add('fade');
        await sleep(props.fadeDuration);
        await sleep(props.waitBeforeRestart);
      }
    }

    onMounted(() => {
      const tag = root.value as HTMLElement | null;
      const l1 = line1Ref.value as HTMLElement | null;
      if (!tag || !l1) return;
      void runSequence(tag, l1);
    });

    return () =>
      h('div', { ref: root, class: 'tagline typewriter', style: 'display:flex;flex-direction:column;align-items:center;text-align:center' }, [
        h('div', { ref: line1Ref, class: 'text line line-1' }),
        h('div', { ref: line2Ref, class: 'text line line-2' }),
        h('span', { ref: caret1Ref, class: 'caret' }),
        h('span', { ref: caret2Ref, class: 'caret', style: 'visibility:hidden' }),
      ]);
  },
});



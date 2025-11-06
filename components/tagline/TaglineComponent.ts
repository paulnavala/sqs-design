import { defineComponent, h, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Tagline',
  props: {
    line1: { type: String, default: 'Every pixel tells a story.' },
    line2: { type: String, default: ' Let the world know yours.' },
    typeSpeed: { type: Number, default: 65 },
    typeVariance: { type: Number, default: 25 },
    waitBetweenLines: { type: Number, default: 2000 },
    holdAfterLine2: { type: Number, default: 5000 },
    fadeDuration: { type: Number, default: 2500 },
    waitBeforeRestart: { type: Number, default: 20000 },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const line1Ref = ref<HTMLElement | null>(null);
    const line2Ref = ref<HTMLElement | null>(null);
    const caretRef = ref<HTMLElement | null>(null);

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

    async function typeText(text: string, baseSpeed: number, textEl: HTMLElement) {
      for (let i = 0; i < text.length; i++) {
        clearPreviousGlow(textEl);
        const span = makeCharSpan(text[i]);
        textEl.appendChild(span);
        // Move caret to follow the newest character
        if (caretRef.value) {
          textEl.appendChild(caretRef.value);
        }
        const variance = Math.random() * props.typeVariance - props.typeVariance / 2;
        const delay = Math.max(20, baseSpeed + variance);
        await sleep(delay);
      }
      clearPreviousGlow(textEl);
    }

    function resetTagline(tag: HTMLElement, line1El: HTMLElement, caretEl: HTMLElement) {
      tag.classList.remove('fade');
      line1El.innerHTML = '';
      if (line2Ref.value) line2Ref.value.innerHTML = '';
      caretEl.classList.remove('exit', 'fade-in');
      caretEl.style.display = 'inline-block';
      caretEl.style.opacity = '1';
      caretEl.style.transform = 'translateX(0)';
      caretEl.style.animation = 'blink 1s ease-in-out infinite';
      // Start caret in line 1
      line1El.appendChild(caretEl);
    }

    function hideCaret(caretEl: HTMLElement) {
      caretEl.style.animation = 'none';
      caretEl.style.opacity = '0';
      caretEl.style.display = 'none';
    }

    async function runSequence(tag: HTMLElement, line1El: HTMLElement, caretEl: HTMLElement) {
      while (true) {
        const l1 = line1El;
        const l2 = line2Ref.value as HTMLElement | null;
        resetTagline(tag, l1, caretEl);
        await typeText(String(props.line1), props.typeSpeed, l1);
        await sleep(props.waitBetweenLines);
        if (l2) {
          // Move caret to start of line 2 before typing
          l2.appendChild(caretEl);
          await typeText(String(props.line2), props.typeSpeed, l2);
        }
        hideCaret(caretEl);
        await sleep(props.holdAfterLine2);
        tag.classList.add('fade');
        await sleep(props.fadeDuration);
        await sleep(props.waitBeforeRestart);
      }
    }

    onMounted(() => {
      const tag = root.value as HTMLElement | null;
      const l1 = line1Ref.value as HTMLElement | null;
      const caretEl = caretRef.value as HTMLElement | null;
      if (!tag || !l1 || !caretEl) return;
      void runSequence(tag, l1, caretEl);
    });

    return () =>
      h('div', { ref: root, class: 'tagline typewriter', style: 'display:flex;flex-direction:column;align-items:center;text-align:center' }, [
        h('div', { ref: line1Ref, class: 'text line line-1' }),
        h('div', { ref: line2Ref, class: 'text line line-2', style: 'margin-top:0.2em' }),
        h('span', { ref: caretRef, class: 'caret' }),
      ]);
  },
});



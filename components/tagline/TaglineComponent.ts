import { defineComponent, h, onMounted, ref, type Ref } from 'vue';
import { isReducedMotion } from '../_shared/dom';

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
    const line1Chars = ref<string[]>([]);
    const line2Chars = ref<string[]>([]);
    const activeLine = ref<1 | 2>(1);
    const fading = ref(false);
    const caretVisible = ref(true);

    function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

    async function typeText(text: string, target: Ref<string[]>) {
      for (let i = 0; i < text.length; i++) {
        const t = text[i] === ' ' ? '\u00A0' : text[i];
        target.value = [...target.value, t];
        const variance = Math.random() * props.typeVariance - props.typeVariance / 2;
        const delay = Math.max(20, props.typeSpeed + variance);
        if (!isReducedMotion()) await sleep(delay);
      }
    }

    async function run() {
      while (true) {
        fading.value = false;
        caretVisible.value = true;
        activeLine.value = 1;
        line1Chars.value = [];
        line2Chars.value = [];
        await typeText(props.line1, line1Chars);
        if (!isReducedMotion()) await sleep(props.waitBetweenLines);
        activeLine.value = 2;
        await typeText(props.line2, line2Chars);
        caretVisible.value = false;
        if (!isReducedMotion()) await sleep(props.holdAfterLine2);
        fading.value = true;
        if (!isReducedMotion()) await sleep(props.fadeDuration);
        if (!isReducedMotion()) await sleep(props.waitBeforeRestart);
      }
    }

    onMounted(run);

    function renderLine(chars: string[], isActive: boolean) {
      const children = chars.map((c, i) => h('span', {
        key: i,
        style: i === chars.length - 1 && chars.length > 0 ? 'animation:tagline-glow 0.6s ease;' : 'animation:none;'
      }, c));
      if (isActive && caretVisible.value) {
        children.push(h('span', {
          class: 'caret',
          style: 'display:inline-block;margin-left:0.25em;width:0.6ch;height:1.05em;transform:translateY(0.1em);background:currentColor;animation:tagline-blink 1s ease-in-out infinite;',
          'aria-hidden': 'true'
        }));
      }
      return children;
    }

    return () => h('div', { class: 'tagline', style: 'display:inline-flex;flex-direction:column;align-items:center;text-align:center' }, [
      h('style', `
        @keyframes tagline-blink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }
        @keyframes tagline-glow {
          0% { text-shadow: 0 0 0.6em rgba(0,0,0,0.25); filter: brightness(1.08); }
          60% { text-shadow: 0 0 0.25em rgba(0,0,0,0.18); filter: brightness(1.02); }
          100% { text-shadow: none; filter: none; }
        }
      `),
      h('div', {
        class: 'text line-1',
        style: (fading.value ? 'opacity:0;transition:opacity 2.5s;' : 'opacity:1;transition:opacity 0.4s;') + 'color:var(--ink,#1f2937)'
      }, renderLine(line1Chars.value, activeLine.value === 1)),
      h('div', {
        class: 'text line-2',
        style: (fading.value ? 'opacity:0;transition:opacity 2.5s;' : 'opacity:1;transition:opacity 0.4s;') + 'color:var(--ink,#1f2937);margin-top:0.2em;'
      }, renderLine(line2Chars.value, activeLine.value === 2)),
    ]);
  },
});



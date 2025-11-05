// Fortune Peach — logic only
// - No CSS imports (Squarespace loaders inject CSS)
// - Bundled as single IIFE via Vite library build to components/fortune-peach/fortune-peach.js
// - Safe to embed via code injection and global loader

import { isReducedMotion } from '../_shared/dom';

type Elements = {
  stage: HTMLElement;
  cracking: HTMLElement;
  revealed: HTMLElement;
  quoteEl: HTMLElement;
  ballsEl: HTMLElement;
  particles: HTMLElement;
};

const FORTUNES: string[] = [
  'The best time to plant a tree was 20 years ago. The second best time is now.',
  "Your limitation—it's only your imagination.",
  'Great things never come from comfort zones.',
  "Success doesn't just find you. You have to go out and get it.",
  'Dream bigger. Do bigger.',
  "Don't stop when you're tired. Stop when you're done.",
  'Wake up with determination. Go to bed with satisfaction.',
  'Little by little, a little becomes a lot.',
  'The secret of getting ahead is getting started.',
  "Believe you can and you're halfway there.",
  "Opportunities don't happen. You create them.",
  "Everything you've ever wanted is on the other side of fear.",
];

const LUCKY_NUMBERS = { count: 6, min: 1, max: 70 } as const;
const TIMING = { crackingDuration: 1500, particleCleanup: 1500 } as const;

function randomFortune() {
  const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  const nums = new Set<number>();
  while (nums.size < LUCKY_NUMBERS.count) {
    nums.add(
      LUCKY_NUMBERS.min + Math.floor(Math.random() * (LUCKY_NUMBERS.max - LUCKY_NUMBERS.min + 1))
    );
  }
  return { quote, lucky: Array.from(nums).sort((a, b) => a - b) };
}

function setStage(
  name: 'unopened' | 'cracking' | 'revealed',
  stage: HTMLElement,
  cracking: HTMLElement,
  revealed: HTMLElement
) {
  stage.classList.remove('flw-stage--unopened', 'flw-stage--cracking', 'flw-stage--revealed');
  stage.classList.add('flw-stage--' + name);
  const showCracking = name === 'cracking';
  const showRevealed = name === 'revealed';
  cracking.hidden = !showCracking;
  revealed.hidden = !showRevealed;
  cracking.setAttribute('aria-hidden', String(!showCracking));
  revealed.setAttribute('aria-hidden', String(!showRevealed));
}

/** Emit particle bursts from the cookie center; respects reduced motion. */
function spawnParticles(particles: HTMLElement) {
  particles.innerHTML = '';
  if (isReducedMotion()) return;
  const count = 20;
  const box = particles.getBoundingClientRect();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'flw-p animate';
    particle.style.left = box.width / 2 + 'px';
    particle.style.top = box.height / 2 + 'px';
    const dx = (Math.random() - 0.5) * 220;
    const dy = (Math.random() - 0.5) * 220;
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');
    particle.style.animationDelay = 0.3 + Math.random() * 0.3 + 's';
    frag.appendChild(particle);
  }
  requestAnimationFrame(() => {
    particles.appendChild(frag);
    setTimeout(() => (particles.innerHTML = ''), TIMING.particleCleanup);
  });
}

function createLuckyBall(n: number, index: number, ballsEl: HTMLElement) {
  const ball = document.createElement('span');
  ball.className = 'flw-ball';
  ball.style.animationDelay = 0.1 * index + 0.2 + 's';
  ball.textContent = String(n);
  ball.style.margin = '0';
  ball.style.padding = '0';
  ballsEl.appendChild(ball);
}

function crack(elements: Elements) {
  const { stage, cracking, revealed, quoteEl, ballsEl, particles } = elements;
  const pick = randomFortune();
  setStage('cracking', stage, cracking, revealed);
  spawnParticles(particles);
  let delay = TIMING.crackingDuration;
  if (isReducedMotion()) delay = 0;
  setTimeout(() => {
    quoteEl.textContent = '"' + pick.quote + '"';
    ballsEl.innerHTML = '';
    pick.lucky.forEach((n, idx) => createLuckyBall(n, idx, ballsEl));
    setStage('revealed', stage, cracking, revealed);
  }, delay);
}

function reset(elements: Elements) {
  const { stage, cracking, revealed } = elements;
  setStage('unopened', stage, cracking, revealed);
}

function initFortuneLogoWidget(): void {
  const stage = document.getElementById('flwStage') as HTMLElement | null;
  if (!stage) return;
  const logoBtn = document.getElementById('flwLogoBtn') as HTMLElement | null;
  const tapBtn = document.getElementById('flwTap') as HTMLElement | null;
  const cracking = document.getElementById('flwCracking') as HTMLElement | null;
  const revealed = document.getElementById('flwRevealed') as HTMLElement | null;
  const again = document.getElementById('flwAgain') as HTMLElement | null;
  const quoteEl = document.getElementById('flwQuote') as HTMLElement | null;
  const ballsEl = document.getElementById('flwBalls') as HTMLElement | null;
  const particles = document.getElementById('flwParticles') as HTMLElement | null;
  if (!logoBtn || !tapBtn || !cracking || !revealed || !again || !quoteEl || !ballsEl || !particles)
    return;

  const elements = { stage, cracking, revealed, quoteEl, ballsEl, particles } as Elements;
  logoBtn.addEventListener('click', () => crack(elements));
  tapBtn.addEventListener('click', () => crack(elements));
  again.addEventListener('click', () => reset(elements));
  logoBtn.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      crack(elements);
    }
  });
  stage.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && stage.classList.contains('flw-stage--revealed')) {
      e.preventDefault();
      reset(elements);
    }
  });
}

// Expose globals
// @ts-ignore
window.initFortuneLogoWidget = initFortuneLogoWidget;
// @ts-ignore
window.initFortunePeach = initFortuneLogoWidget;

/** Initialize immediately if present; otherwise observe DOM until injected. */
function tryInitOrObserve() {
  const stage = document.getElementById('flwStage');
  if (stage) return initFortuneLogoWidget();
  const obs = new MutationObserver(() => {
    const el = document.getElementById('flwStage');
    if (el) {
      obs.disconnect();
      initFortuneLogoWidget();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInitOrObserve);
} else {
  tryInitOrObserve();
}

(() => {
  'use strict';
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const light = document.createElement('div');
  light.className = 'mouse-spotlight';
  light.setAttribute('aria-hidden', 'true');
  document.body.append(light);
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, visible = false;
  function draw() {
    frame = 0;
    x = targetX;
    y = targetY;
    light.style.transform = `translate3d(${x - 32}px, ${y - 32}px, 0)`;
    if (visible && (Math.abs(targetX - x) > .2 || Math.abs(targetY - y) > .2)) frame = requestAnimationFrame(draw);
  }
  function hide() {
    visible = false;
    light.classList.remove('is-visible');
    document.documentElement.classList.remove('custom-light-cursor');
    cancelAnimationFrame(frame); frame = 0;
  }
  window.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse') return;
    const host = document.querySelector('dialog[open]') || document.body;
    if (light.parentElement !== host) host.append(light);
    targetX = event.clientX; targetY = event.clientY;
    if (!visible) {
      x = targetX; y = targetY; visible = true;
      light.classList.add('is-visible');
      document.documentElement.classList.add('custom-light-cursor');
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  enabled.addEventListener('change', hide);
})();

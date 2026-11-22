(() => {
  const root = document.getElementById('earth-entry-preview');
  // Two-dimensional rig of the supplied illustration. All coordinates are in
  // the original 629 × 1210 texture; no generated video or external service.
  (() => {
    const image = root.querySelector('#character');
    const canvas = document.createElement('canvas');
    canvas.width = 629;
    canvas.height = 1210;
    canvas.className = image.className;
    canvas.id = 'animated-character';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '眼睛随鼠标移动、会眨眼的像素小人');
    canvas.hidden = true;
    image.after(canvas);
    const ctx = canvas.getContext('2d');
    const texture = document.createElement('canvas');
    texture.width = 629;
    texture.height = 1210;
    const paint = texture.getContext('2d');
    let ready = false;
    let lastDraw = null;
    const eyes = [{
      cx: 222,
      x: 147,
      y: 313,
      w: 134,
      h: 98,
      inner: [
        [167, 335],
        [271, 335],
        [267, 376],
        [253, 398],
        [237, 404],
        [197, 402],
        [179, 390],
        [170, 367]
      ],
      iris: [181, 333, 86, 70],
      skin: '#ffd4b6'
    }, {
      cx: 414,
      x: 353,
      y: 313,
      w: 141,
      h: 98,
      inner: [
        [366, 335],
        [474, 335],
        [468, 374],
        [450, 397],
        [432, 403],
        [391, 400],
        [374, 384],
        [367, 365]
      ],
      iris: [367, 333, 88, 70],
      skin: '#ffdabd'
    }];

    function polygon(context, points) {
      context.beginPath();
      points.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
      context.closePath();
    }

    function draw(gazeX = 0, gazeY = 0, blink = 0) {
      if (!ready) return;
      if (lastDraw && Math.abs(gazeX - lastDraw[0]) < .001 && Math.abs(gazeY - lastDraw[1]) < .001 && Math.abs(blink - lastDraw[2]) < .001) return;
      lastDraw = [gazeX, gazeY, blink];
      // Restore only the two small eye regions; hair, clothes and body stay cached.
      for (const eye of eyes) {
        paint.clearRect(eye.x, eye.y, eye.w, eye.h);
        paint.drawImage(image, eye.x, eye.y, eye.w, eye.h, eye.x, eye.y, eye.w, eye.h);
      }
      for (const eye of eyes) {
        paint.save();
        polygon(paint, eye.inner);
        paint.clip();
        paint.fillStyle = '#fbfaf8';
        paint.fillRect(eye.x, eye.y, eye.w, eye.h);
        const [sx, sy, sw, sh] = eye.iris;
        paint.drawImage(image, sx, sy, sw, sh, sx + gazeX * 9, sy + gazeY * 5, sw, sh);
        paint.restore();
        if (blink > 0) {
          // Eyelid follows the eye silhouette, never paints across the bangs.
          paint.save();
          polygon(paint, eye.inner);
          paint.clip();
          paint.fillStyle = eye.skin;
          paint.fillRect(eye.x, 331, eye.w, 76 * blink);
          paint.restore();
          if (blink > .65) {
            paint.strokeStyle = '#16100f';
            paint.lineWidth = 6;
            paint.lineJoin = 'miter';
            paint.beginPath();
            paint.moveTo(eye.cx - 45, 349);
            paint.lineTo(eye.cx - 25, 354);
            paint.lineTo(eye.cx + 20, 354);
            paint.lineTo(eye.cx + 43, 348);
            paint.stroke();
          }
        }
      }
      ctx.clearRect(0, 0, 629, 1210);
      ctx.imageSmoothingEnabled = false;
      // Coalesce adjacent scanlines with exactly the same displacement.
      // Keeps the original pixels, but uses 1-13 draw calls instead of 605.
      let from = 0,
        offsetX = Math.round(gazeX * 9),
        offsetY = Math.round(gazeY * 3);
      for (let row = 430; row < 532; row += 2) {
        const weight = Math.max(0, (530 - row) / 100);
        const dx = Math.round(gazeX * 9 * weight);
        const dy = Math.round(gazeY * 3 * weight);
        if (dx !== offsetX || dy !== offsetY) {
          const height = row - from;
          if (height) ctx.drawImage(texture, 0, from, 629, height, offsetX, from + offsetY, 629, height);
          from = row;
          offsetX = dx;
          offsetY = dy;
        }
      }
      ctx.drawImage(texture, 0, from, 629, 1210 - from, offsetX, from + offsetY, 629, 1210 - from);
    }

    function load() {
      paint.drawImage(image, 0, 0);
      ready = true;
      lastDraw = null;
      draw();
      canvas.hidden = false;
      image.hidden = true;
    }
    image.addEventListener('load', load, {
      once: true
    });
    if (image.complete && image.naturalWidth) load();
    root.companionFace = {
      draw,
      canvas
    };
  })();

  (() => {
    const scene = root.querySelector('#scene');
    const image = root.querySelector('#character');
    const stage = root.querySelector('.stage');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let bounds;

    function measureBounds() {
      const rect = stage.getBoundingClientRect();
      bounds = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        sceneWidth: scene.clientWidth,
        sceneHeight: scene.clientHeight
      };
    }
    measureBounds();
    const sizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureBounds) : null;
    if (sizeObserver) sizeObserver.observe(stage);
    window.addEventListener('resize', measureBounds);
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    let frame = 0,
      previous = 0,
      blinkStart = null,
      timer;
    const active = () => !reduced.matches && !document.hidden;

    function scheduleBlink() {
      clearTimeout(timer);
      if (active()) timer = setTimeout(() => {
        blinkStart = performance.now();
        start();
      }, 2800 + Math.random() * 3200);
    }

    function tick(time) {
      frame = 0;
      const dt = Math.min((time - (previous || time)) / 1000, .05);
      previous = time;
      const blend = 1 - Math.exp(-8 * dt);
      x += (tx - x) * blend;
      y += (ty - y) * blend;
      const elapsed = blinkStart === null ? -1 : time - blinkStart;
      const blink = elapsed < 0 || elapsed > 190 ? 0 : Math.sin(elapsed / 190 * Math.PI);
      if (elapsed >= 190) {
        blinkStart = null;
        scheduleBlink();
      }
      const transform = `translate(${x * 12}px,${y * 6}px) rotate(${x * 1.8}deg)`;
      const rig = root.companionFace;
      if (!rig || rig.canvas.hidden) image.style.transform = transform;
      if (rig) {
        rig.canvas.style.transform = transform;
        rig.draw(x, y, active() ? blink : 0);
      }
      if (active() && (blinkStart !== null || Math.abs(tx - x) + Math.abs(ty - y) > .0015)) frame = requestAnimationFrame(tick);
      else previous = 0;
    }

    function start() {
      if (!frame) {
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function reset() {
      tx = ty = 0;
      start();
    }
    scene.addEventListener('pointermove', event => {
      if (!active()) return;
      tx = Math.tanh((event.clientX - bounds.left - bounds.width * .5) / (bounds.sceneWidth * .25));
      ty = Math.tanh((event.clientY - bounds.top - bounds.height * .29) / (bounds.sceneHeight * .3));
      start();
    });
    scene.addEventListener('pointerleave', reset);
    scene.addEventListener('pointercancel', reset);
    scene.addEventListener('pointerup', event => {
      if (event.pointerType !== 'mouse') reset();
    });
    window.addEventListener('blur', reset);

    function motionPreference() {
      clearTimeout(timer);
      blinkStart = null;
      tx = ty = x = y = 0;
      start();
      scheduleBlink();
    }
    reduced.addEventListener('change', motionPreference);
    document.addEventListener('visibilitychange', motionPreference);
    // Suspend background work when the page is left, including back/forward cache.
    window.addEventListener('pagehide', () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      frame = 0;
    });
    window.addEventListener('pageshow', scheduleBlink);
    scheduleBlink();
  })();

})();

(() => {
  const root = document.getElementById('earth-entry-preview');
  const stage = root && root.querySelector('.stage');
  if (!stage || !stage.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  stage.setAttribute('role', 'button');
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-label', '点击或按回车，让小人开心跳一下');
  let idle = null,
    jump = null,
    timer = null,
    disposed = false;
  const allowed = () => !disposed && !reduced.matches && !document.hidden;

  function clearTimer() {
    clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    clearTimer();
    if (allowed()) timer = setTimeout(() => hop(), 8000 + Math.random() * 5000);
  }

  function breathe() {
    if (!allowed() || idle) return;
    idle = stage.animate([{
      transform: 'translateY(0) rotate(0deg)'
    }, {
      transform: 'translateY(-3px) rotate(.6deg)'
    }, {
      transform: 'translateY(0) rotate(0deg)'
    }, {
      transform: 'translateY(-2px) rotate(-.6deg)'
    }, {
      transform: 'translateY(0) rotate(0deg)'
    }], {
      duration: 4200,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  }

  function hop() {
    if (!allowed() || jump) return;
    clearTimer();
    if (idle) {
      idle.cancel();
      idle = null;
    }
    const height = Math.min(44, stage.clientHeight * .095);
    jump = stage.animate([{
      offset: 0,
      transform: 'translateY(0) scale(1,1) rotate(0deg)'
    }, {
      offset: .13,
      transform: 'translateY(3px) scale(1.045,.955) rotate(0deg)'
    }, {
      offset: .39,
      transform: `translateY(${-height}px) scale(.985,1.015) rotate(-2deg)`
    }, {
      offset: .55,
      transform: `translateY(${-height - 3}px) scale(1,1) rotate(1.5deg)`
    }, {
      offset: .79,
      transform: 'translateY(0) scale(1.055,.945) rotate(0deg)'
    }, {
      offset: .9,
      transform: 'translateY(-4px) scale(.99,1.01) rotate(0deg)'
    }, {
      offset: 1,
      transform: 'translateY(0) scale(1,1) rotate(0deg)'
    }], {
      duration: 820,
      easing: 'ease-in-out',
      iterations: 1
    });
    const animation = jump;
    animation.onfinish = () => {
      if (jump !== animation) return;
      jump = null;
      animation.cancel();
      breathe();
      schedule();
    };
  }

  function stop() {
    clearTimer();
    if (jump) {
      jump.onfinish = null;
      jump.cancel();
      jump = null;
    }
    if (idle) {
      idle.cancel();
      idle = null;
    }
  }

  function reconcile() {
    stop();
    if (allowed()) {
      breathe();
      schedule();
    }
  }
  stage.addEventListener('click', hop);
  stage.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hop();
    }
  });
  reduced.addEventListener('change', reconcile);
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('pagehide', () => {
    disposed = true;
    stop();
  });
  window.addEventListener('pageshow', () => {
    disposed = false;
    reconcile();
  });
  reconcile();
})();

// The ENTER anchor scrolls within this document. The dock appears after the cover.
(() => {
  const cover = document.getElementById("earth-entry-preview");
  const entry = cover?.querySelector(".entry");
  if (!cover || !entry) return;
  let scheduled = false;
  const update = () => {
    const onCover = cover.getBoundingClientRect().bottom > innerHeight * .35;
    document.body.toggleAttribute("data-cover-active", onCover);
    scheduled = false;
  };
  addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener("resize", update);
  addEventListener("pageshow", update);
  update();
})();


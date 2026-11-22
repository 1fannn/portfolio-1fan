(() => {
  'use strict';
  const track = document.querySelector('#project-track');
  if (!track) return;
  const previous = document.querySelector('#project-previous');
  const next = document.querySelector('#project-next');
  const pagination = document.querySelector('#project-pagination');
  const position = document.querySelector('#project-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cards = [], angle = 0, target = 0, velocity = 0, dragging = false;
  let startX = 0, startY = 0, lastX = 0, lastTime = 0, moved = false;
  let lastFrame = performance.now(), active = -1;
  const wrap = (value, count) => ((value % count) + count) % count;
  function paint() {
    const count = cards.length;
    if (!count) return;
    const step = 360 / count;
    const current = wrap(Math.round(-angle / step), count);
    const width = cards[0].offsetWidth;
    const radius = count < 2 ? 0 : Math.max(width * .83, width / (2 * Math.tan(Math.PI / Math.max(count,3))));
    cards.forEach((card, i) => {
      const deg = ((angle + i * step + 180) % 360 + 360) % 360 - 180;
      const rad = deg * Math.PI / 180;
      const front = Math.cos(rad);
      card.style.transform = `translate(-50%, -50%) translate3d(${Math.sin(rad)*radius}px, 0, ${(front-1)*radius}px) rotateY(${deg * .65}deg)`;
      card.style.zIndex = String(Math.round((front+1)*100));
      card.style.opacity = front < -.05 ? '0' : String(.5 + Math.max(0,front)*.5);
      card.style.pointerEvents = i === current ? 'auto' : 'none';
      card.inert = i !== current;
      card.setAttribute('aria-label', `${i+1} of ${count}: ${card.querySelector('h3').textContent}`);
    });
    if (current !== active) {
      active = current;
      position.textContent = String(current+1).padStart(2,'0') + ' / ' + String(count).padStart(2,'0');
      [...pagination.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
    }
  }
  function go(index) {
    if (cards.length < 2) return;
    const step = 360/cards.length;
    target = -index*step;
    velocity = 0;
    if(reduced.matches) { angle=target; paint(); }
  }
  function rebuild() {
    cards=[...track.querySelectorAll('.project-card:not([hidden])')];
    angle=target=velocity=0; active=-1;
    pagination.replaceChildren();
    cards.forEach((card,i)=>{
      const dot=document.createElement('button'); dot.type='button';
      dot.setAttribute('aria-label','Show '+card.querySelector('h3').textContent);
      dot.addEventListener('click',()=>{
        const step=360/cards.length;
        const current=Math.round(-angle/step);
        let delta=wrap(i-wrap(current,cards.length),cards.length);
        if(delta>cards.length/2) delta-=cards.length;
        go(current+delta);
      });pagination.append(dot);
    });
    previous.disabled=next.disabled=cards.length<2;
    paint();
  }
  previous.addEventListener('click',()=>go(Math.round(-angle/(360/cards.length))-1));
  next.addEventListener('click',()=>go(Math.round(-angle/(360/cards.length))+1));
  track.addEventListener('pointerdown',event=>{
    if(event.button!==0 || cards.length<2) return;
    dragging=true;startX=lastX=event.clientX;startY=event.clientY;lastTime=performance.now();moved=false;velocity=0;
  });
  window.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const now=performance.now(), dx=event.clientX-lastX;
    if(!moved && Math.abs(event.clientY-startY)>Math.abs(event.clientX-startX)+10){dragging=false;return;}
    if(Math.abs(event.clientX-startX)>6){moved=true;track.classList.add('is-dragging');}
    if(moved){angle+=dx*.3;velocity=dx*.3/Math.max(8,now-lastTime)*16.67;target=angle;paint();}
    lastX=event.clientX;lastTime=now;
  });
  function release(cancel=false){
    if(!dragging)return;dragging=false;track.classList.remove('is-dragging');
    if(performance.now()-lastTime>100||cancel)velocity=0;
    const step=360/cards.length;
    target=Math.round((angle+(reduced.matches?0:Math.max(-45,Math.min(45,velocity*6))))/step)*step;
  }
  window.addEventListener('pointerup',()=>release());
  window.addEventListener('pointercancel',()=>release(true));
  track.addEventListener('click',event=>{if(moved){event.preventDefault();event.stopImmediatePropagation();moved=false;}},true);
  track.addEventListener('dragstart',event=>event.preventDefault());
  track.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const current=Math.round(-angle/(360/cards.length));
    go(event.key==='Home'?0:event.key==='End'?cards.length-1:current+(event.key==='ArrowRight'?1:-1));
  });
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',rebuild));
  new ResizeObserver(paint).observe(track);
  rebuild();
  function animate(now){
    const dt=Math.min(2.5,(now-lastFrame)/16.67);lastFrame=now;
    if(!dragging && cards.length>1 && !document.hidden){
      if (reduced.matches) angle = target;
      else {angle+=(target-angle)*(1-Math.pow(.83,dt));if(Math.abs(target-angle)<.005)angle=target;}
      paint();
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

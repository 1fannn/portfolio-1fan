(() => {
  'use strict';
  // Add future CCA and hobby entries here. Images are optional until supplied.
  const activities = [{
    title: 'Volunteering', organisation: 'PCFS - National Sports Association',
    date: 'Nov 2025 – Jul 2026', role: 'Volunteer',
    cover: 'assets/images/activities/pcfs-cycling.jpg',
    photos: [
      { src: 'assets/images/activities/pcfs-cycling.jpg', alt: 'Participants cycling together outdoors during a PCFS activity.' },
      { src: 'assets/images/activities/pcfs-group.jpg', alt: 'PCFS participants and volunteers posing together at Shimano Cycling World.' },
      { src: 'assets/images/activities/pcfs-volunteers.jpg', alt: 'Six volunteers in purple PCFS shirts posing together outdoors.' }
    ],
    summary: 'Helping children build confidence on two wheels, with patient guidance and practical support.',
    paragraphs: [
      'I volunteered with PCFS - National Sports Association, supporting children with health challenges as they learned to ride bicycles.',
      'I guided the children with patience and step-by-step support, helping them develop their cycling skills and build confidence as they practised.',
      'Alongside supporting the children, I checked and maintained bicycle tools and equipment to help the organisers keep activities safe and running smoothly.'
    ]
  }, {
    title: 'Part-time Job', organisation: 'Nine Fresh, Koufu',
    date: '', role: 'Service Crew',
    cover: 'assets/images/activities/nine-fresh-preparation.jpg',
    photos: [
      { src: 'assets/images/activities/nine-fresh-preparation.jpg', alt: 'Prepared dessert ingredients and containers at the Nine Fresh workstation.' },
      { src: 'assets/images/activities/nine-fresh-supplies.jpg', alt: 'Boxes of supplies and serving equipment at the Nine Fresh counter.' }
    ],
    summary: 'Building customer relationships and supporting the team through busy service periods.',
    paragraphs: [
      'As a Service Crew member at Nine Fresh, Koufu, I contribute to achieving a new store sales record while processing transactions accurately and maintaining service and hygiene standards.',
      'I build positive customer relationships that encourage repeat visits, while coordinating with team members during busy periods.'
    ]
  }];
  const drum = document.querySelector('#activity-drum');
  if (!drum) return;
  const caption = document.querySelector('#activity-caption');
  const counter = document.querySelector('#activity-position');
  const dialog = document.querySelector('#activity-dialog');
  const content = document.querySelector('#activity-dialog-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const prefix = document.body.dataset.root || '';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const asset = value => value && !/^(?:[a-z]+:|\/\/)/i.test(value) && !value.split('/').includes('..') ? prefix + value : '';
  let position = 0, current = -1, angle = 0, target = 0, drag = null, dragged = false, wheelAt = 0, opener = null;
  const tiles = activities.map((item, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'activity-tile';
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','activity-dialog');
    button.setAttribute('aria-label','Read about '+item.title);
    button.innerHTML = '<span class="activity-tile-visual">' + (asset(item.cover) ? '<img src="'+escape(asset(item.cover))+'" alt="'+escape(item.title)+'"/>' : '<span class="activity-tile-number">'+String(i+1).padStart(2,'0')+'</span><span class="activity-tile-word">'+escape(item.title)+'</span>')+'</span><span class="activity-tile-bottom"><span>Off-screen moments</span><strong>Read story</strong></span>';
    button.addEventListener('click',event=>{
      if(dragged){event.preventDefault();dragged=false;return;}
      opener=button;
      content.innerHTML='<h2 id="activity-dialog-title">'+escape(item.title)+'</h2><h3>'+escape(item.organisation)+'</h3><p class="activity-dialog-meta">'+escape(item.role)+'</p>'+item.paragraphs.map(text=>'<p>'+escape(text)+'</p>').join('')+(item.photos.length?'<div class="activity-photo-gallery">'+item.photos.filter(photo=>asset(photo.src)).map(photo=>'<img src="'+escape(asset(photo.src))+'" alt="'+escape(photo.alt)+'" loading="lazy"/>').join('')+'</div>':'');
      dialog.showModal();document.documentElement.classList.add('activity-reading');content.scrollTop=0;
    });drum.append(button);return button;
  });
  function paint(){
    const step=360/activities.length;
    tiles.forEach((tile,i)=>{
      const deg=activities.length===1?0:((angle+i*step+180)%360+360)%360-180;
      const rad=deg*Math.PI/180, radius=240;
      tile.style.transform=`translate(-50%,-50%) translate3d(0,${-Math.sin(rad)*radius}px,${(Math.cos(rad)-1)*radius}px) rotateX(${deg*.65}deg)`;
      tile.style.opacity=Math.cos(rad)<0?'0':String(.4+.6*Math.cos(rad));
      tile.inert=i!==position;tile.style.pointerEvents=i===position?'auto':'none';
    });
    if(current!==position){
      current=position;const item=activities[position];
      caption.innerHTML='<h3>'+escape(item.title)+'</h3><p>'+escape(item.summary)+'</p>';
      counter.textContent=String(position+1).padStart(2,'0')+' / '+String(activities.length).padStart(2,'0');
    }
  }
  function go(index){if(activities.length<2)return;position=((index%activities.length)+activities.length)%activities.length;target=-index*(360/activities.length);if(reduced.matches){angle=target;paint();}else requestAnimationFrame(animate);paint();}
  function animate(){angle+=(target-angle)*.18;paint();if(Math.abs(target-angle)>.05)requestAnimationFrame(animate);else{angle=target;paint();}}
  document.querySelector('#activity-step-controls').hidden=activities.length<2;
  drum.classList.toggle('has-multiple',activities.length>1);
  document.querySelector('#activity-previous').addEventListener('click',()=>go(Math.round(-target/(360/activities.length))-1));
  document.querySelector('#activity-next').addEventListener('click',()=>go(Math.round(-target/(360/activities.length))+1));
  drum.addEventListener('keydown',event=>{if(activities.length<2)return;if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?activities.length-1:Math.round(-target/(360/activities.length))+(event.key==='ArrowDown'?1:-1));}});
  drum.addEventListener('wheel',event=>{if(activities.length<2||Math.abs(event.deltaY)<5)return;event.preventDefault();if(performance.now()-wheelAt<450)return;wheelAt=performance.now();go(Math.round(-target/(360/activities.length))+(event.deltaY>0?1:-1));},{passive:false});
  drum.addEventListener('pointerdown',event=>{if(activities.length>1&&event.button===0){drag={y:event.clientY,start:target};dragged=false;}});
  window.addEventListener('pointermove',event=>{if(!drag)return;const dy=event.clientY-drag.y;if(Math.abs(dy)>8)dragged=true;if(dragged){angle=drag.start+dy*.35;paint();}});
  window.addEventListener('pointerup',()=>{if(drag){drag=null;if(dragged)go(Math.round(-angle/(360/activities.length)));}});
  window.addEventListener('pointercancel',()=>{drag=null;go(Math.round(-target/(360/activities.length)));});
  document.querySelector('#activity-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('activity-reading');opener?.focus({preventScroll:true});});
  paint();
})();

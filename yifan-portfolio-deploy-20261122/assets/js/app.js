(() => {
  "use strict";
  const data = window.PORTFOLIO;
  if (!data) return;
  const prefix = document.body.dataset.root || "";
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  } [c]));
  const paths = {
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    pen: '<path d="m4 20 1-6L17 2l5 5-12 12-6 1Zm10-15 5 5M4 20l6-6"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    cloud: '<path d="M7 19a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 0 1-1 10Z"/>',
    branch: '<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M18 8v2c0 4-12 2-12 7"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>'
  };
  const icon = key => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[key] || paths.code) + '</svg>';
  const safeLink = value => {
    try {
      const u = new URL(value);
      return /^https?:$/.test(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  const imagePath = value => value && !/^(?:[a-z]+:|\/\/)/i.test(value) && !value.split('/').includes('..') ? prefix + value : "";
  document.querySelectorAll('[data-profile]').forEach(el => {
    const value = data.profile[el.dataset.profile];
    if (value != null) el.textContent = value;
  });
  const photo = document.querySelector('#profile-photo');
  const portrait = imagePath(data.profile.photo);
  if (photo && portrait) {
    photo.addEventListener('load', () => {
      photo.hidden = false;
      document.querySelector('.portrait-placeholder').hidden = true;
    });
    photo.addEventListener('error', () => {
      photo.hidden = true;
      document.querySelector('.portrait-placeholder').hidden = false;
    });
    photo.alt = data.profile.photoAlt;
    photo.src = portrait;
  }
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  ['experience', 'education'].forEach(type => document.querySelectorAll('[data-collection="' + type + '"]').forEach(container => {
    container.innerHTML = data[type].length ? data[type].map(item => '<article class="timeline-item"><p class="timeline-date">' + escape(item.date) + '</p><div class="timeline-marker" aria-hidden="true"></div><div class="timeline-copy"><h3>' + escape(item.title) + '</h3><p class="timeline-subtitle">' + escape(item.subtitle) + '</p><p class="timeline-description">' + escape(item.description) + '</p></div></article>').join('') : '<p class="fallback">Details coming soon.</p>';
  }));
  document.querySelectorAll('[data-collection="projects"]').forEach(container => {
    container.innerHTML = data.projects.map(item => {
      const image = imagePath(item.image);
      return '<article class="project-card" data-category="' + escape(item.category) + '"><div class="project-cover' + (image ? ' has-image' : '') + '" style="--cover:' + (/^#[a-f0-9]{6}$/i.test(item.coverColor) ? item.coverColor : '#dedacb') + '">' + (image ? '<img src="' + escape(image) + '" alt="' + escape(item.imageAlt) + '" loading="lazy">' : '<span class="cover-type">' + escape(item.coverText) + '</span>') + '</div><div class="project-info"><h3>' + escape(item.title) + '</h3><p class="project-meta">' + [item.role, item.year].filter(Boolean).map(escape).join(' · ') + '</p><p>' + escape(item.summary) + '</p><button class="project-open" type="button" data-project="' + escape(item.id) + '" aria-haspopup="dialog">View details</button></div></article>';
    }).join('');
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    const empty = document.querySelector('.project-empty');
    if (empty) empty.hidden = count > 0;
  }));
  const dialog = document.querySelector('.project-dialog');
  let projectOpener = null;
  if (dialog) {
    document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
      const item = data.projects.find(p => p.id === button.dataset.project);
      if (!item) return;
      const links = [
        ['github', 'GitHub'],
        ['live', 'Live project']
      ].map(([key, label]) => {
        const url = safeLink(item[key]);
        return url ? '<a href="' + escape(url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>' : '';
      }).join('');
      document.querySelector('#project-dialog-body').innerHTML = '<p class="dialog-category">' + escape(item.categoryLabel || item.category).replace(" / ", ' <strong class="text-slash">/</strong> ') + '</p><h2 id="project-dialog-title">' + escape(item.title) + '</h2><p>' + escape(item.details) + '</p>' + (item.highlights?.length ? '<ul class="project-highlights">' + item.highlights.map(point => '<li>' + escape(point) + '</li>').join('') + '</ul>' : '') + (item.gallery?.length ? '<div class="project-gallery">' + item.gallery.map(picture => '<img src="' + escape(imagePath(picture.image)) + '" alt="' + escape(picture.alt) + '" loading="lazy">').join('') + '</div>' : '') + '<h3>Tools <strong class="text-slash">/</strong> methods</h3><p>' + escape(item.stack) + '</p>' + (links ? '<div class="dialog-links">' + links + '</div>' : '<p class="dialog-note">Project links will appear here when added.</p>');
      projectOpener = button;
      dialog.showModal();
      document.body.classList.add('modal-open');
    }));
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      projectOpener?.focus({
        preventScroll: true
      });
    });
  }
  document.querySelectorAll('[data-collection="skills"]').forEach(container => {
    if (!data.skills.length) {
      container.innerHTML = '<p class="fallback">Skills coming soon.</p>';
      return;
    }
    const middle = Math.ceil(data.skills.length / 2);
    const groups = [data.skills.slice(0, middle), data.skills.slice(middle)].filter(g => g.length);
    container.innerHTML = groups.map(group => {
      let expanded = [...group];
      while (expanded.length < 8) expanded.push(...group);
      const items = expanded.map((s, i) => '<div class="skill-item"' + (i >= group.length ? ' aria-hidden="true"' : '') + '>' + '<img class="skill-logo" src="' + escape(prefix + 'assets/icons/skills/' + s.icon + '.svg') + '" alt="" width="28" height="28" decoding="async">' + '<span>' + escape(s.name) + '</span></div>').join('');
      return '<div class="skill-track"><div class="skill-set">' + items + '</div><div class="skill-set" aria-hidden="true">' + items + '</div></div>';
    }).join('');
  });
  ['strengths'].forEach(collection => {
    document.querySelectorAll('[data-collection="' + collection + '"]').forEach(element => {
      element.textContent = (data[collection] || []).join(' · ');
    });
  });
  const pause = document.querySelector('.motion-toggle');
  if (pause) pause.addEventListener('click', () => {
    const paused = document.querySelector('.skills-marquee').classList.toggle('paused');
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume animation' : 'Pause animation';
  });
  // The dock now follows four pages instead of individual Home sections.
  const currentPage = document.body.dataset.page;
  const activePage = ['home', 'about', 'projects', 'contact'].includes(currentPage)
    ? currentPage : 'home';
  document.querySelectorAll('.floating-nav [data-nav]').forEach(link => {
    if (link.dataset.nav === activePage) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    }), {
      threshold: .08
    });
    document.querySelectorAll('.intro-copy > *, .portrait, .section-heading, .timeline-item, .project-card').forEach((el, i) => {
      el.style.setProperty('--delay', ((i % 3) * 65) + 'ms');
      observer.observe(el);
    });
  }
})();

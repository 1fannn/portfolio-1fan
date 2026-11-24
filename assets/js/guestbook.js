(() => {
  'use strict';
  const form = document.querySelector('#guestbook-form');
  if (!form) return;
  const message = form.querySelector('#guest-message');
  const name = form.querySelector('#guest-name');
  const submit = form.querySelector('[type="submit"]');
  const count = document.querySelector('#note-count');
  const status = document.querySelector('#note-status');
  const loading = document.querySelector('#notes-loading');
  const list = document.querySelector('#notes-list');
  const total = document.querySelector('#note-total');
  const more = document.querySelector('#more-notes');
  const refresh = document.querySelector('#refresh-notes');
  const sound = document.querySelector('#typewriter-sound');
  const keys = [...document.querySelectorAll('[data-type-key]')];
  const wallDialog = document.querySelector('#note-wall-dialog');
  const openWall = document.querySelector('#open-note-wall');
  const miniBoard = document.querySelector('#wall-mini-board');
  const previewTotal = document.querySelector('#wall-preview-total');
  const previewStatus = document.querySelector('#wall-preview-status');

  openWall.addEventListener('click', () => {
    wallDialog.showModal();
    document.documentElement.classList.add('note-wall-open');
  });
  document.querySelector('#close-note-wall').addEventListener('click', () => wallDialog.close());
  const maximizeWall = document.querySelector('#maximize-note-wall');
  maximizeWall.addEventListener('click', () => {
    const expanded = wallDialog.classList.toggle('is-maximized');
    maximizeWall.setAttribute('aria-pressed', String(expanded));
    maximizeWall.setAttribute('aria-label', expanded ? 'Restore note wall size' : 'Maximize note wall');
  });
  wallDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('note-wall-open');
    openWall.focus({ preventScroll: true });
  });
  wallDialog.addEventListener('click', event => {
    if (event.target !== wallDialog) return;
    const bounds = wallDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) wallDialog.close();
  });
  function syncWallPreview() {
    const number = Number(total.textContent.replace(/\D/g, '')) || 0;
    previewTotal.textContent = number + (number === 1 ? ' note' : ' notes');
    miniBoard.replaceChildren();
    [...list.children].slice(0, 3).forEach(note => {
      const paper = document.createElement('span');
      paper.className = 'wall-mini-note';
      const text = document.createElement('span');
      text.textContent = note.querySelector('p').textContent;
      const author = document.createElement('span');
      author.className = 'wall-mini-author';
      author.textContent = note.querySelector('strong').textContent;
      paper.append(text, author); miniBoard.append(paper);
    });
    if (!list.children.length) {
      const empty = document.createElement('span');
      empty.className = 'wall-empty-preview';
      empty.textContent = 'Your note could be the first one here.';
      miniBoard.append(empty);
    }
    previewStatus.textContent = list.children.length ? 'Click to unfold every little thought.' : loading.textContent;
  }
  const wallObserver = new MutationObserver(syncWallPreview);
  wallObserver.observe(list, { childList: true });
  wallObserver.observe(total, { childList: true });
  wallObserver.observe(loading, { childList: true, subtree: true, characterData: true });

  const filePreview = location.protocol === 'file:';
  const commentsEndpoint = location.hostname === '1fannn.github.io'
    ? 'https://yifan-guestbook-api.vtrt9hvm9k.chatgpt.site/api/comments'
    : '/api/comments';
  const DRAFT_KEY = 'yifan-public-note-draft';
  let nextBefore = null;
  let posting = false;
  let fetching = false;
  let shift = false;
  let soundOn = false;
  let requestVersion = 0;

  function setStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }

  function updateDraft() {
    count.textContent = message.value.length + ' / 1200';
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: name.value, message: message.value })); } catch {}
  }

  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (draft && typeof draft.message === 'string') message.value = draft.message.slice(0, 1200);
    if (draft && typeof draft.name === 'string') name.value = draft.name.slice(0, 50);
  } catch {}
  updateDraft();
  message.addEventListener('input', updateDraft);
  name.addEventListener('input', updateDraft);

  // Original audio from https://typewriter-sage.vercel.app/sounds/.
  const soundRoot = new URL('../audio/typewriter/', document.currentScript.src);
  const soundFiles = ['key1', 'key2', 'key3', 'key4', 'space', 'return'];
  const soundPools = new Map();
  let lastKeySound = -1;

  function clickSound(key = '') {
    if (!soundOn) return;
    try {
      let index = Math.floor(Math.random() * 4);
      if (index === lastKeySound) index = (index + 1) % 4;
      lastKeySound = index;
      const file = key === 'Space' ? 'space' : key === 'Enter' ? 'return' : soundFiles[index];
      let pool = soundPools.get(file);
      if (!pool) {
        pool = Array.from({ length: 6 }, () => {
          const clip = new Audio(new URL(file + '.wav', soundRoot).href);
          clip.preload = 'auto';
          clip.volume = file === 'return' ? .8 : .95;
          return clip;
        });
        soundPools.set(file, pool);
      }
      const clip = pool.find(item => item.paused || item.ended) || pool[0];
      clip.currentTime = 0;
      clip.playbackRate = file === 'return' ? 1 : .94 + Math.random() * .12;
      clip.play().catch(() => {});
    } catch {}
  }

  function press(key) {
    const button = keys.find(button => button.dataset.typeKey === key);
    if (button) {
      button.classList.add('is-pressed');
      clearTimeout(button.pressTimer);
      button.pressTimer = setTimeout(() => button.classList.remove('is-pressed'), 110);
    }
    clickSound(key);
  }

  function insertKey(key) {
    if (key === 'Shift') {
      shift = !shift;
      document.querySelector('.tw-shift').classList.toggle('is-on', shift);
      return;
    }
    let start = message.selectionStart;
    const end = message.selectionEnd;
    if (key === 'Backspace') {
      if (start === end && start > 0) {
        // Remove a full Unicode code point when a touch key is used.
        const last = Array.from(message.value.slice(0, start)).at(-1);
        start -= last?.length || 0;
      }
      message.setRangeText('', start, end, 'end');
    } else {
      const text = key === 'Space' ? ' ' : key === 'Enter' ? '\n' : (shift ? key : key.toLowerCase());
      if (message.value.length - (end - start) + text.length > 1200) return;
      message.setRangeText(text, start, end, 'end');
      if (shift) {
        shift = false;
        document.querySelector('.tw-shift').classList.remove('is-on');
      }
    }
    message.focus({ preventScroll: true });
    message.dispatchEvent(new Event('input', { bubbles: true }));
  }

  keys.forEach(button => {
    button.addEventListener('pointerdown', event => event.preventDefault());
    button.addEventListener('click', () => {
      press(button.dataset.typeKey);
      insertKey(button.dataset.typeKey);
    });
  });
  message.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); form.requestSubmit(); return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key === ' ' ? 'Space' : event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (keys.some(button => button.dataset.typeKey === key)) press(key);
  });
  sound.addEventListener('click', () => {
    soundOn = !soundOn;
    sound.setAttribute('aria-pressed', String(soundOn));
    sound.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) clickSound();
  });
  document.querySelector('#clear-note').addEventListener('click', () => {
    message.value = '';
    updateDraft(); setStatus('Draft cleared.');
    message.focus({ preventScroll: true });
  });

  function renderNote(note) {
    const item = document.createElement('li');
    item.className = 'visitor-note';
    item.dataset.noteId = String(note.id);
    const text = document.createElement('p');
    text.textContent = note.message;
    const footer = document.createElement('footer');
    const author = document.createElement('strong');
    author.textContent = note.name || 'Anonymous';
    const time = document.createElement('time');
    time.dateTime = note.createdAt;
    time.textContent = new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    footer.append(author, time); item.append(text, footer);
    return item;
  }

  async function loadNotes(append = false) {
    if (filePreview) {
      loading.hidden = false;
      loading.textContent = 'Open the website through its server to read and post public notes.';
      const link = document.createElement('a');
      link.href = 'http://127.0.0.1:8788/pages/about.html';
      link.textContent = ' Open local guestbook';
      loading.append(link);
      more.hidden = true;
      return;
    }
    if (fetching) return;
    fetching = true;
    refresh.disabled = true; more.disabled = true;
    const version = ++requestVersion;
    try {
      const query = append && nextBefore ? '?before=' + encodeURIComponent(nextBefore) : '';
      const response = await fetch(commentsEndpoint + query, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('The note wall is offline. Please try again later.');
      const data = await response.json();
      if (!Array.isArray(data.comments)) throw new Error('The note wall is offline. Please try again later.');
      if (version !== requestVersion) return;
      if (!append) list.replaceChildren();
      const ids = new Set([...list.children].map(item => item.dataset.noteId));
      data.comments.forEach(note => { if (!ids.has(String(note.id))) list.append(renderNote(note)); });
      nextBefore = data.nextBefore;
      total.textContent = data.total ? '(' + data.total + ')' : '';
      more.hidden = !nextBefore;
      loading.hidden = list.children.length > 0;
      loading.textContent = 'No notes yet. Be the first to leave one.';
    } catch (error) {
      loading.hidden = false;
      loading.textContent = error instanceof TypeError ? 'The note wall is offline. Please try again later.' : error.message || 'The note wall is offline. Please try again later.';
    } finally {
      fetching = false; refresh.disabled = false; more.disabled = false;
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (posting) return;
    if (filePreview) {
      setStatus('Open the local guestbook link on the note wall to publish a note.', true);
      return;
    }
    const note = message.value.trim();
    if (!note || note.length > 1200) {
      setStatus('Please write a note between 1 and 1,200 characters.', true);
      message.focus(); return;
    }
    posting = true; submit.disabled = true;
    submit.textContent = 'Posting…';
    setStatus('Posting your note…');
    try {
      const response = await fetch(commentsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.value.trim(), message: note })
      });
      let data;
      try { data = await response.json(); } catch { throw new Error('The note could not be saved. Please try again.'); }
      if (!response.ok) throw new Error(data.error || 'The note could not be saved. Please try again.');
      if (!data.comment?.id) throw new Error('The note could not be saved. Please try again.');
      requestVersion += 1;
      message.value = ''; updateDraft();
      setStatus('Your note is on the wall. Thank you!');
      // The new public note appears immediately, even if a separate refresh fails.
      const existing = list.querySelector('[data-note-id="' + data.comment.id + '"]');
      if (!existing) list.prepend(renderNote(data.comment));
      loading.hidden = true;
      const currentTotal = Number(total.textContent.replace(/\D/g, '')) || 0;
      total.textContent = '(' + (Number(data.total) || currentTotal + 1) + ')';
    } catch (error) {
      setStatus(error instanceof TypeError ? 'The note could not be saved. Your draft is still here.' : error.message || 'The note could not be saved. Your draft is still here.', true);
    } finally {
      posting = false; submit.disabled = false; submit.textContent = 'Post note';
    }
  });

  refresh.addEventListener('click', () => loadNotes(false));
  more.addEventListener('click', () => loadNotes(true));
  loadNotes();
})();



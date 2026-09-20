/* ==========================================================
   Purple date invitation — script.js
   ========================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------
     CONFIG — where her answer is sent.
     Her answer is posted to a private ntfy.sh channel (free, no account).
     Open inbox.html to read the answers, or install the ntfy app on your
     phone and subscribe to this same code to get an instant notification.
     Keep this code secret. Anyone who has it can read the channel.
     ------------------------------------------------------ */
  const CONFIG = {
    NTFY_TOPIC: 'ika-date-679oow8ejo93xxynkhjddf',
    NTFY_SERVER: 'https://ntfy.sh',
    TITLE: 'Ika said YES 💜'
  };

  /* ------------------------------------------------------
     Helpers
     ------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ------------------------------------------------------
     State
     ------------------------------------------------------ */
  const state = {
    saidYes: false,
    submitted: false,
    location: '',
    date: '',
    time: '',
    activity: '',
    note: ''
  };

  /* ------------------------------------------------------
     Screen navigation (with working browser Back)
     ------------------------------------------------------ */
  const screens = {};
  document.querySelectorAll('.screen').forEach((el) => {
    screens[el.dataset.screen] = el;
  });

  let current = 'intro';
  let autoTimer = null;

  const parkTimers = {};

  function activate(name, shouldFocus) {
    Object.keys(screens).forEach((key) => {
      const el = screens[key];
      const on = key === name;
      clearTimeout(parkTimers[key]);

      if (on) {
        // Un-park first (display:none -> block) so the fade/slide transition still plays.
        if (el.classList.contains('is-parked')) {
          el.classList.remove('is-parked');
          void el.offsetWidth; // force reflow
        }
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
        // After the fade-out, remove it from layout so page height follows the visible card.
        parkTimers[key] = setTimeout(() => el.classList.add('is-parked'), 700);
      }

      el.setAttribute('aria-hidden', on ? 'false' : 'true');
      if ('inert' in el) el.inert = !on;
    });

    if (shouldFocus) {
      const target = $('[data-focus]', screens[name]);
      if (target) target.focus({ preventScroll: true });
    }
  }

  /**
   * mode: 'push' (new history entry) | 'replace' | 'none' (already handled by popstate)
   */
  function goTo(name, mode = 'push') {
    if (!screens[name]) return;
    clearTimeout(autoTimer);
    current = name;

    if (name === 'question') resetNo();

    activate(name, true);
    window.scrollTo(0, 0);

    try {
      if (mode === 'push') history.pushState({ screen: name }, '', '#' + name);
      else if (mode === 'replace') history.replaceState({ screen: name }, '', '#' + name);
    } catch (err) { /* history can be unavailable in some sandboxes — ignore */ }
  }

  function guard(name) {
    const allowed = {
      intro: true,
      question: true,
      yes: state.saidYes,
      details: state.saidYes,
      done: state.submitted
    };
    return allowed[name] ? name : 'intro';
  }

  window.addEventListener('popstate', (e) => {
    const name = e.state && e.state.screen ? e.state.screen : 'intro';
    goTo(guard(name), 'none');
  });

  function goBack(fallback) {
    if (history.state && history.state.screen === current && history.length > 1) {
      history.back();
    } else {
      goTo(fallback, 'none');
    }
  }

  /* ------------------------------------------------------
     Background floaters + twinkling stars
     ------------------------------------------------------ */
  function buildBackground() {
    const host = $('#floaters');
    if (!host) return;
    const frag = document.createDocumentFragment();
    const symbols = ['💜', '✦', '✨', '💜', '•', '✦'];

    for (let i = 0; i < 26; i++) {
      const dur = rand(14, 30);
      const el = document.createElement('span');
      el.className = 'floater';
      el.textContent = pick(symbols);
      el.style.setProperty('--x', rand(2, 96).toFixed(1) + '%');
      el.style.setProperty('--size', rand(12, 30).toFixed(0) + 'px');
      el.style.setProperty('--dur', dur.toFixed(1) + 's');
      el.style.setProperty('--delay', (-rand(0, dur)).toFixed(1) + 's');
      el.style.setProperty('--drift', rand(-60, 60).toFixed(0) + 'px');
      el.style.setProperty('--spin', rand(-40, 40).toFixed(0) + 'deg');
      el.style.setProperty('--op', rand(0.35, 0.8).toFixed(2));
      frag.appendChild(el);
    }

    for (let i = 0; i < 22; i++) {
      const el = document.createElement('span');
      el.className = 'star';
      el.textContent = pick(['✦', '✧', '·']);
      el.style.setProperty('--x', rand(1, 98).toFixed(1) + '%');
      el.style.setProperty('--y', rand(1, 98).toFixed(1) + '%');
      el.style.setProperty('--size', rand(8, 18).toFixed(0) + 'px');
      el.style.setProperty('--dur', rand(2.5, 6).toFixed(1) + 's');
      el.style.setProperty('--delay', (-rand(0, 6)).toFixed(1) + 's');
      frag.appendChild(el);
    }

    host.appendChild(frag);
  }

  /* Hearts + sparkles released from the bottom of the screen */
  function releaseHearts(count) {
    if (reduceMotion) return;
    const symbols = ['💜', '✨', '💜', '💫', '💜'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      const dur = rand(2.4, 4.2);
      el.className = 'burst';
      el.textContent = pick(symbols);
      el.style.setProperty('--left', rand(2, 96).toFixed(1) + '%');
      el.style.setProperty('--size', rand(18, 38).toFixed(0) + 'px');
      el.style.setProperty('--dur', dur.toFixed(2) + 's');
      el.style.setProperty('--delay', rand(0, 0.9).toFixed(2) + 's');
      el.style.setProperty('--dx', rand(-90, 90).toFixed(0) + 'px');
      el.style.setProperty('--rot', rand(-50, 50).toFixed(0) + 'deg');
      el.addEventListener('animationend', () => el.remove());
      document.body.appendChild(el);
    }
  }

  /* ------------------------------------------------------
     Purple confetti (canvas)
     ------------------------------------------------------ */
  const canvas = $('#confetti');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const COLORS = ['#4C1D95', '#6D28D9', '#8B5CF6', '#A78BFA', '#C4B5FD', '#EDE9FE', '#FFFFFF'];
  let particles = [];
  let rafId = null;
  let W = 0;
  let H = 0;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addParticle(x, y, angle, speed) {
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: rand(6, 11),
      h: rand(4, 8),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.3, 0.3),
      wobble: rand(0, Math.PI * 2),
      color: pick(COLORS),
      round: Math.random() < 0.3,
      gravity: rand(0.16, 0.26),
      life: 0,
      max: rand(140, 250)
    });
  }

  function burst(x, y, count, centerAngle, spread, minSpeed, maxSpeed) {
    for (let i = 0; i < count; i++) {
      const angle = centerAngle + rand(-spread / 2, spread / 2);
      addParticle(x, y, angle, rand(minSpeed, maxSpeed));
    }
    startLoop();
  }

  function rain(duration) {
    const end = performance.now() + duration;
    (function step() {
      for (let i = 0; i < 4; i++) {
        addParticle(rand(0, W), -12, Math.PI / 2 + rand(-0.4, 0.4), rand(1.5, 4));
      }
      startLoop();
      if (performance.now() < end) setTimeout(step, 70);
    })();
  }

  function startLoop() {
    if (rafId === null && particles.length) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles = particles.filter((p) => p.life < p.max && p.y < H + 30);

    for (const p of particles) {
      p.life++;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.gravity;
      p.x += p.vx + Math.sin(p.wobble + p.life * 0.08) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;

      const fadeStart = p.max * 0.7;
      const alpha = p.life > fadeStart ? Math.max(0, 1 - (p.life - fadeStart) / (p.max - fadeStart)) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    if (particles.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function celebrate() {
    if (reduceMotion || !ctx) return;
    burst(W / 2, H * 0.42, 140, -Math.PI / 2, Math.PI * 2, 6, 17);
    burst(0, H * 0.9, 70, -Math.PI / 3, 0.9, 12, 24);
    burst(W, H * 0.9, 70, (-2 * Math.PI) / 3, 0.9, 12, 24);
    rain(1800);
    releaseHearts(22);
  }

  function softCelebrate() {
    if (reduceMotion || !ctx) return;
    burst(W / 2, H * 0.35, 70, -Math.PI / 2, Math.PI * 2, 5, 13);
    rain(1200);
    releaseHearts(14);
  }

  /* ------------------------------------------------------
     The escaping "No" button
     ------------------------------------------------------ */
  const arena = $('#arena');
  const yesBtn = $('#yesBtn');
  const noBtn = $('#noBtn');
  const noSlot = $('#noSlot');

  const TRIGGER_DISTANCE = 95;   // px — how close the cursor gets before No runs away
  const EDGE_PADDING = 20;       // px — keeps No safely inside the arena + screen
  let lastMove = 0;

  function distToRect(px, py, r) {
    const dx = Math.max(r.left - px, 0, px - r.right);
    const dy = Math.max(r.top - py, 0, py - r.bottom);
    return Math.hypot(dx, dy);
  }

  function cancelNoAnimations() {
    if (typeof noBtn.getAnimations === 'function') {
      noBtn.getAnimations().forEach((a) => a.cancel());
    }
  }

  function resetNo() {
    cancelNoAnimations();
    noBtn.classList.remove('is-free');
    noBtn.style.left = '';
    noBtn.style.top = '';
    noSlot.style.width = '';
    noSlot.style.height = '';
  }

  function moveNo(px, py, force) {
    const now = performance.now();
    if (!force && now - lastMove < 140) return;
    lastMove = now;

    const a = arena.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();     // includes any in-flight transform
    const bw = noBtn.offsetWidth;
    const bh = noBtn.offsetHeight;
    const oldX = b.left;
    const oldY = b.top;

    cancelNoAnimations();

    // First escape: keep the empty slot in the layout, then take the button out of flow.
    if (!noBtn.classList.contains('is-free')) {
      noSlot.style.width = bw + 'px';
      noSlot.style.height = bh + 'px';
      noBtn.style.left = (oldX - a.left) + 'px';
      noBtn.style.top = (oldY - a.top) + 'px';
      noBtn.classList.add('is-free');
    }

    // Allowed area = arena ∩ visible viewport, so it can never leave the screen.
    const minX = Math.max(a.left, 0) + EDGE_PADDING;
    const minY = Math.max(a.top, 0) + EDGE_PADDING;
    const maxX = Math.max(minX, Math.min(a.right, window.innerWidth) - bw - EDGE_PADDING);
    const maxY = Math.max(minY, Math.min(a.bottom, window.innerHeight) - bh - EDGE_PADDING);

    const yes = yesBtn.getBoundingClientRect();
    let bestX = minX;
    let bestY = minY;
    let bestScore = -Infinity;

    for (let i = 0; i < 50; i++) {
      const x = rand(minX, maxX);
      const y = rand(minY, maxY);
      const cx = x + bw / 2;
      const cy = y + bh / 2;

      const overlapsYes =
        x < yes.right + 14 && x + bw > yes.left - 14 &&
        y < yes.bottom + 14 && y + bh > yes.top - 14;

      const fromPointer = px == null ? 400 : Math.hypot(cx - px, cy - py);
      const travelled = Math.hypot(x - oldX, y - oldY);

      const score =
        (overlapsYes ? -2000 : 0) +
        Math.min(fromPointer, 420) +
        Math.min(travelled, 300) * 0.5 +
        rand(0, 40);

      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }

    // Place at the destination; animate from the old spot (FLIP) with a spring + tilt.
    noBtn.style.left = (bestX - a.left) + 'px';
    noBtn.style.top = (bestY - a.top) + 'px';

    if (!reduceMotion && typeof noBtn.animate === 'function') {
      const dx = oldX - bestX;
      const dy = oldY - bestY;
      const tilt = rand(6, 14) * (Math.random() < 0.5 ? -1 : 1);
      noBtn.animate([
        { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(.96)`, easing: 'cubic-bezier(.2,.9,.3,1)', offset: 0 },
        { transform: `translate(${-dx * 0.07}px, ${-dy * 0.07}px) rotate(${tilt}deg) scale(1.05)`, easing: 'ease-in-out', offset: 0.62 },
        { transform: `translate(0, 0) rotate(${-tilt / 3}deg) scale(1.07, .92)`, easing: 'ease-in-out', offset: 0.8 },
        { transform: 'translate(0, 0) rotate(0deg) scale(.98, 1.03)', easing: 'ease-out', offset: 0.9 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', offset: 1 }
      ], { duration: 480 });
    }
  }

  // Desktop: run away as the cursor gets close.
  document.addEventListener('pointermove', (e) => {
    if (current !== 'question' || e.pointerType === 'touch') return;
    const r = noBtn.getBoundingClientRect();
    if (distToRect(e.clientX, e.clientY, r) < TRIGGER_DISTANCE) {
      moveNo(e.clientX, e.clientY, false);
    }
  }, { passive: true });

  // Mobile / any press: it dodges before it can be pressed.
  noBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    moveNo(e.clientX, e.clientY, true);
  });

  // Keyboard (Enter/Space) or a click that slipped through: it just moves again.
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNo(null, null, true);
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    if (noBtn.classList.contains('is-free')) resetNo();
  });

  /* ------------------------------------------------------
     Navigation buttons
     ------------------------------------------------------ */
  $('#introContinue').addEventListener('click', () => goTo('question', 'push'));

  yesBtn.addEventListener('click', () => {
    state.saidYes = true;
    celebrate();
    goTo('yes', 'push');
    autoTimer = setTimeout(() => {
      if (current === 'yes') goTo('details', 'replace');
    }, 3800);
  });

  $('#toDetails').addEventListener('click', () => goTo('details', 'replace'));
  $('#backBtn').addEventListener('click', () => goBack('question'));
  $('#editBtn').addEventListener('click', () => goBack('details'));

  /* ------------------------------------------------------
     Form
     ------------------------------------------------------ */
  const form = $('#dateForm');
  const fields = {
    location: { input: $('#fPlace'), error: $('#errPlace'), message: 'Please tell me where you’d like to go 💜' },
    date:     { input: $('#fDay'),   error: $('#errDay'),   message: 'Please tell me what day works for you 💜' },
    time:     { input: $('#fTime'),  error: $('#errTime'),  message: 'Please tell me what time works for you 💜' }
  };
  const planInput = $('#fPlan');
  const noteInput = $('#fNote');
  const submitBtn = $('#submitBtn');

  function readFieldValue(input) {
    return input ? input.value.trim() : '';
  }

  function setFieldError(key, message) {
    const f = fields[key];
    if (!f || !f.input || !f.error) return;

    const wrap = f.input.closest('.field');
    f.error.textContent = message || '';
    wrap?.classList.toggle('has-error', Boolean(message));
    f.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field.input) return;

    field.input.addEventListener('input', () => {
      if (field.input.value.trim()) setFieldError(key, '');
    });
  });

  function validateForm() {
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (!field.input) return;

      const empty = !field.input.value.trim();
      setFieldError(key, empty ? field.message : '');
      if (empty && !firstInvalid) firstInvalid = field.input;
    });
    return firstInvalid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstInvalid = validateForm();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    state.location = readFieldValue(fields.location.input);
    state.date = readFieldValue(fields.date.input);
    state.time = readFieldValue(fields.time.input);
    state.activity = readFieldValue(planInput);
    state.note = readFieldValue(noteInput);
    state.submitted = true;

    renderSummary();
    goTo('done', 'push');
    softCelebrate();
    sendAnswer();
  });

  /* ------------------------------------------------------
     Confirmation landing page
     ------------------------------------------------------ */
  function renderSummary() {
    $('#sumPlace').textContent = state.location;
    $('#sumDay').textContent = state.date;
    $('#sumTime').textContent = state.time;
    $('#sumPlan').textContent = state.activity || 'Let’s decide together ✨';

    const noteRow = $('#sumNoteRow');
    noteRow.hidden = !state.note;
    $('#sumNote').textContent = state.note;
  }

  /* ------------------------------------------------------
     Sending the answer to your private inbox
     ------------------------------------------------------ */
  const statusBox = $('#sendStatus');
  const statusText = $('#statusText');
  const statusActions = $('#statusActions');
  const retryBtn = $('#retryBtn');

  function setStatus(kind, reason) {
    statusBox.dataset.state = kind;
    statusActions.hidden = kind !== 'failed';

    if (kind === 'sending') {
      statusText.textContent = 'Sending your answer to me… 💌';
    } else if (kind === 'sent') {
      statusText.textContent = 'Sent! I’ve got your answer 💜';
    } else {
      // Technical details are only shown to you when you add ?debug to the address.
      const debug = /[?&]debug\b/.test(window.location.search);
      statusText.textContent = 'Hmm, that didn’t go through. Tap “Try again” so I get your answer 💌' +
        (debug && reason ? ' [' + reason + ']' : '');
    }
  }

  function messageText() {
    const lines = [
      '📍 Place: ' + state.location,
      '📅 Date: ' + state.date,
      '⏰ Time: ' + state.time,
      '✨ Plan: ' + (state.activity || '(to be decided together)')
    ];
    if (state.note) lines.push('💬 Note: ' + state.note);
    return lines.join('\n');
  }

  async function postToInbox() {
    if (!CONFIG.NTFY_TOPIC || /^CHANGE/i.test(CONFIG.NTFY_TOPIC)) {
      throw new Error('NTFY_TOPIC is not set in script.js');
    }

    const params = new URLSearchParams({ title: CONFIG.TITLE, tags: 'purple_heart', priority: '4' });
    const url = CONFIG.NTFY_SERVER + '/' + encodeURIComponent(CONFIG.NTFY_TOPIC) + '?' + params.toString();

    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 15000) : null;

    try {
      // Plain-text body = a "simple" request, so no CORS preflight is needed.
      const res = await fetch(url, {
        method: 'POST',
        body: messageText(),
        signal: controller ? controller.signal : undefined
      });
      if (!res.ok) throw new Error('The inbox replied with status ' + res.status);
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('The request timed out');
      if (err instanceof TypeError) throw new Error('The browser blocked the request (ad blocker or no internet?)');
      throw err;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  async function sendAnswer() {
    setStatus('sending');
    retryBtn.disabled = true;
    try {
      await postToInbox();
      setStatus('sent');
    } catch (err) {
      console.warn('[invitation] Could not send the answer:', err.message);
      setStatus('failed', err.message);
    } finally {
      retryBtn.disabled = false;
    }
  }

  retryBtn.addEventListener('click', sendAnswer);

  /* ------------------------------------------------------
     Init
     ------------------------------------------------------ */
  function init() {
    buildBackground();
    resizeCanvas();

    activate('intro', false);
    Object.keys(screens).forEach((key) => {
      if (key !== 'intro') screens[key].classList.add('is-parked');
    });
    try {
      history.replaceState({ screen: 'intro' }, '', '#intro');
    } catch (err) { /* ignore */ }
  }

  init();
})();
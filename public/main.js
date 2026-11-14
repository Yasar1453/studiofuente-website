(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = c => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(c / 100);

  // ---------- Navigatie ----------
  const nav = $('#nav');
  const hasHero = document.body.classList.contains('has-hero');
  const onScroll = () => nav.classList.toggle('is-solid', !hasHero || window.scrollY > window.innerHeight * 0.75 || document.body.classList.contains('menu-open'));
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('.nav__toggle'), menu = $('#menu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.style.overflow = open ? 'hidden' : '';
    onScroll();
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ---------- Uitklappanelen (Producten, Diensten) ----------
  const megaItems = $$('[data-mega]');
  if (megaItems.length) {
    const shade = Object.assign(document.createElement('div'), { className: 'mega-shade' });
    document.body.appendChild(shade);
    let closeT, openT;
    const close = () => { megaItems.forEach(i => i.classList.remove('is-open')); nav.classList.remove('mega-open'); shade.classList.remove('is-on'); };
    const open = item => {
      clearTimeout(closeT);
      megaItems.forEach(i => i !== item && i.classList.remove('is-open'));
      item.classList.add('is-open'); nav.classList.add('mega-open'); shade.classList.add('is-on');
    };
    megaItems.forEach(item => {
      item.addEventListener('mouseenter', () => { clearTimeout(openT); openT = setTimeout(() => open(item), nav.classList.contains('mega-open') ? 0 : 90); });
      item.addEventListener('mouseleave', () => { clearTimeout(openT); closeT = setTimeout(close, 220); });
      item.addEventListener('focusin', () => open(item));
      item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) closeT = setTimeout(close, 50); });
    });
    $$('.nav__item:not([data-mega]), .nav__tools, .nav__logo').forEach(el => el.addEventListener('mouseenter', () => { clearTimeout(openT); close(); }));
    shade.addEventListener('mouseenter', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Melding verdwijnt vanzelf
  const toastEl = $('.toast');
  if (toastEl) setTimeout(() => toastEl.classList.remove('is-on'), 3800);
  const toast = text => {
    let t = $('.toast') || Object.assign(document.createElement('div'), { className: 'toast', role: 'status' });
    document.body.appendChild(t); t.textContent = text;
    requestAnimationFrame(() => t.classList.add('is-on'));
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
  };

  // ---------- Rustige reveal ----------
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-img').forEach((el, i) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  // ---------- Diensten: foto volgt de muis ----------
  const preview = $('.index__preview');
  if (preview && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const pImg = $('img', preview);
    let x = 0, y = 0, cx = 0, cy = 0, raf;
    const loop = () => { cx += (x - cx) * 0.14; cy += (y - cy) * 0.14; preview.style.left = cx + 'px'; preview.style.top = cy + 'px'; raf = requestAnimationFrame(loop); };
    $$('#index a').forEach(a => {
      new Image().src = a.dataset.img;
      a.addEventListener('mouseenter', e => {
        pImg.src = a.dataset.img; pImg.style.objectPosition = a.dataset.pos || '50% 50%';
        if (!preview.classList.contains('is-on')) { cx = x = e.clientX + 180; cy = y = e.clientY; }
        preview.classList.add('is-on'); cancelAnimationFrame(raf); loop();
      });
      a.addEventListener('mousemove', e => { x = e.clientX + 180; y = e.clientY; });
    });
    $('#index').addEventListener('mouseleave', () => { preview.classList.remove('is-on'); setTimeout(() => cancelAnimationFrame(raf), 400); });
  }

  // ---------- Video's: spelen na elkaar ----------
  const track = $('[data-reels]');
  if (track) {
    const reels = $$('.reel', track);
    const soundBtn = $('[data-reel-sound]');
    let active = -1, inView = false, sound = false;

    let autoScroll = false, autoT;
    const scrollToReel = i => {
      const r = reels[i];
      const left = r.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
      autoScroll = true; clearTimeout(autoT); autoT = setTimeout(() => { autoScroll = false; }, 900);
      track.scrollTo({ left, behavior: 'smooth' });
    };
    // Zelf door de video's scrollen: de video die nu vooraan staat gaat spelen
    const reelInBeeld = () => {
      const pad = parseFloat(getComputedStyle(track).paddingLeft);
      const tb = track.getBoundingClientRect(), links = tb.left + pad;
      const vol = r => { const b = r.getBoundingClientRect(); return b.left >= tb.left - 2 && b.right <= tb.right + 2; };
      // Helemaal aan het eind kan de laatste niet meer vooraan staan: houd dan de actieve als die nog in beeld is
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4 && active > -1 && vol(reels[active])) return active;
      let best = 0, d = Infinity;
      reels.forEach((r, i) => { const x = Math.abs(r.getBoundingClientRect().left - links); if (x < d) { d = x; best = i; } });
      return best;
    };
    let scrollT;
    const naScroll = () => {
      if (autoScroll || !inView) return;
      const i = reelInBeeld();
      if (i !== active) play(i, { scroll: false });
    };
    track.addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = setTimeout(naScroll, 160); }, { passive: true });
    track.addEventListener('scrollend', () => { clearTimeout(autoT); if (autoScroll) { autoScroll = false; return; } clearTimeout(scrollT); naScroll(); });
    const play = (i, { scroll = true } = {}) => {
      if (active > -1 && active !== i) {
        const old = reels[active];
        old.classList.remove('is-active');
        $('video', old).pause();
      }
      active = (i + reels.length) % reels.length;
      const r = reels[active], v = $('video', r);
      r.classList.add('is-active');
      v.muted = !sound;
      v.preload = 'auto';
      if (v.currentTime > 0 && v.ended) v.currentTime = 0;
      v.play().catch(() => { v.muted = true; setSound(false); v.play().catch(() => {}); });
      // Volgende alvast laden
      const nv = $('video', reels[(active + 1) % reels.length]); if (nv.preload === 'none') nv.preload = 'metadata';
      if (scroll) scrollToReel(active);
    };
    reels.forEach((r, i) => {
      const v = $('video', r), bar = $('.reel__bar span', r);
      v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
      v.addEventListener('ended', () => { bar.style.width = '100%'; v.currentTime = 0; if (inView) play(i + 1); });
      r.addEventListener('click', () => {
        if (i === active) { v.paused ? v.play() : v.pause(); return; }
        play(i);
      });
    });
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) play(active < 0 ? 0 : active, { scroll: false });
      else if (active > -1) $('video', reels[active]).pause();
    }, { threshold: 0.35 }).observe(track);
    $$('.track-nav button').forEach(b => b.addEventListener('click', () => play(active + Number(b.dataset.dir))));
    function setSound(on) {
      sound = on;
      if (!soundBtn) return;
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.textContent = on ? 'Geluid uit' : 'Geluid aan';
    }
    soundBtn?.addEventListener('click', () => {
      setSound(!sound);
      if (active > -1) { const v = $('video', reels[active]); v.muted = !sound; if (v.paused) v.play().catch(() => {}); }
    });
  }

  // ---------- Winkelmand-lade ----------
  const drawer = $('#drawer'), drawerBody = $('[data-cart-body]');
  const setCount = n => $$('[data-cart-count]').forEach(el => el.textContent = n);
  let lastFocus = null;
  const openDrawer = () => { lastFocus = document.activeElement; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; setTimeout(() => $('.drawer__head button', drawer).focus(), 50); };
  const closeDrawer = () => { if (!drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocus?.focus?.(); };
  drawer.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = $$('a, button, input, select', drawer).filter(el => el.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  });
  const renderCart = data => { drawerBody.innerHTML = data.html; setCount(data.count); bindCartForms(drawerBody); };
  const post = async (url, form, submitter) => {
    const r = await fetch(url, { method: 'POST', body: new URLSearchParams(new FormData(form, submitter || undefined)), headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    if (!r.ok) throw new Error('Mislukt');
    return r.json();
  };
  let busy = false;
  function bindCartForms(root) {
    $$('[data-cart-update]', root).forEach(f => {
      const input = $('[data-cart-qty]', f);
      input?.addEventListener('change', () => f.requestSubmit());
      f.addEventListener('submit', async e => {
        if (!drawer.contains(f)) return; // op de winkelmandpagina gewoon herladen
        e.preventDefault();
        if (busy) return;
        busy = true;
        try { renderCart(await post(f.action, f, e.submitter)); } catch { location.href = '/winkelmand'; }
        busy = false;
      });
    });
  }
  bindCartForms(document);
  $$('[data-cart-open]').forEach(a => a.addEventListener('click', async e => {
    if (location.pathname === '/winkelmand') return;
    e.preventDefault();
    openDrawer();
    try { renderCart(await (await fetch('/winkelmand', { headers: { Accept: 'application/json' } })).json()); } catch { location.href = '/winkelmand'; }
  }));
  $$('[data-cart-close]').forEach(b => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (drawer.classList.contains('is-open')) closeDrawer(); else if (!menu.hidden) setMenu(false); });

  $$('[data-add-to-cart]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type=submit]', f); btn.disabled = true;
    try {
      renderCart(await post(f.action, f));
      const cart = $('.nav__cart'); cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump');
      openDrawer();
    } catch { toast('Toevoegen lukte niet. Probeer het opnieuw.'); }
    btn.disabled = false;
  }));

  // ---------- Productpagina ----------
  const mainImg = $('[data-gallery-main]');
  $$('.pdp__thumbs button').forEach(b => b.addEventListener('click', () => {
    $$('.pdp__thumbs button').forEach(x => x.classList.toggle('is-on', x === b));
    mainImg.style.opacity = 0;
    setTimeout(() => { mainImg.src = b.dataset.src; mainImg.onload = () => mainImg.style.opacity = 1; }, 180);
  }));

  const qtyInput = $('[data-qty-input]'), totalEl = $('[data-buy-total]'), calc = $('[data-calc]');
  const price = calc ? +calc.dataset.price : null;
  const unitPrice = () => price ?? (parseInt((totalEl?.textContent || '').replace(/\D/g, '')) || 0);
  const basePrice = totalEl ? unitPrice() : 0;
  const updateTotal = () => { if (totalEl && qtyInput) totalEl.textContent = money(basePrice * Math.max(1, +qtyInput.value || 1)); };
  $$('[data-qty]').forEach(b => b.addEventListener('click', () => {
    qtyInput.value = Math.min(999, Math.max(1, (+qtyInput.value || 1) + +b.dataset.qty)); updateTotal();
  }));
  qtyInput?.addEventListener('input', updateTotal);

  if (calc) {
    const m2 = $('[data-calc-m2]', calc), waste = $('[data-calc-waste]', calc), out = $('[data-calc-out]', calc);
    const pack = parseFloat(calc.dataset.pack), unit = calc.dataset.unit;
    const run = () => {
      const need = parseFloat(String(m2.value).replace(',', '.'));
      if (!(need > 0)) { out.textContent = ''; return; }
      const total = need * (waste.checked ? 1.1 : 1);
      let qty;
      if (unit === 'm²') qty = Math.ceil(total);
      else if (pack) qty = Math.ceil(total / pack);
      else return;
      qtyInput.value = Math.min(999, qty); updateTotal();
      out.innerHTML = unit === 'm²'
        ? `Je hebt <strong>${qty} m²</strong> nodig. Aantal is aangepast.`
        : `Je hebt <strong>${qty} ${qty === 1 ? 'pak' : 'pakken'}</strong> nodig (${(qty * pack).toFixed(2).replace('.', ',')} m²). Aantal is aangepast.`;
    };
    m2.addEventListener('input', run); waste.addEventListener('change', run);
  }

  // ---------- Foto's die niet laden: nette tegel ----------
  const markBroken = img => { const box = img.closest('.card__img, .pdp__main, .line__img, .mini'); if (box) box.classList.add('img-missing'); img.style.visibility = 'hidden'; };
  $$('.card__img img, .pdp__main img, .line__img img').forEach(img => {
    if (img.complete && img.naturalWidth === 0 && img.src) markBroken(img);
    img.addEventListener('error', () => markBroken(img));
  });

  // ---------- Sfeerfilmpjes: alleen spelen in beeld ----------
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ambient = $$('video[data-ambient]');
  if (ambient.length && !calm) {
    const vio = new IntersectionObserver(entries => entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.25 });
    ambient.forEach(v => vio.observe(v));
  }

  // ---------- Galerijstrook: pijlen ----------
  $$('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    const strip = b.closest('section').querySelector('[data-strip]');
    const fig = strip?.querySelector('figure'); if (!fig) return;
    strip.scrollBy({ left: (fig.offsetWidth + 16) * 2 * Number(b.dataset.scroll), behavior: 'smooth' });
  }));

  // ---------- Filters ----------
  $$('[data-autosubmit]').forEach(s => s.addEventListener('change', () => s.form.submit()));

  // ---------- Afrekenen ----------
  const address = $('[data-address]');
  const syncDelivery = () => {
    const pickup = $('[data-delivery]:checked')?.value === 'ophalen';
    if (!address) return;
    address.hidden = pickup;
    $$('input', address).forEach(i => i.required = !pickup);
  };
  $$('[data-delivery]').forEach(r => r.addEventListener('change', syncDelivery)); syncDelivery();
  const acc = $('[data-account]'), pw = $('[data-password]');
  acc?.addEventListener('change', () => { pw.hidden = !acc.checked; });
})();

/* Brede foto vult precies de rest van het eerste scherm, zodat hij niet half in beeld staat. */
(function () {
  var wide = document.querySelector('.page-head + .wide');
  if (!wide) return;
  function fit() {
    var top = wide.getBoundingClientRect().top + window.scrollY;
    wide.style.setProperty('--rest', Math.round(window.innerHeight - top) + 'px');
  }
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();

/* Banner op telefoon: wissel elke paar seconden naar de volgende video. */
(function () {
  var box = document.querySelector('[data-hero-panels]');
  if (!box) return;
  var panels = box.querySelectorAll('.hero__panel'), i = 0;
  setInterval(function () {
    if (!matchMedia('(max-width: 640px)').matches || document.hidden) return;
    panels[i].classList.remove('is-on');
    i = (i + 1) % panels.length;
    panels[i].classList.add('is-on');
  }, 6000);
})();

/* Afspraak plannen: stap voor stap, vrije tijden komen van de server. */
(function () {
  var form = document.querySelector('[data-plan]');
  if (!form) return;
  var steps = form.querySelectorAll('.plan__step'), times = form.querySelector('[data-plan-times]'), summary = form.querySelector('[data-plan-summary]');
  var val = function (n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
  var label = function (n) { var el = form.querySelector('input[name="' + n + '"]:checked'); if (!el) return ''; var t = el.parentNode.querySelector('strong') || el.parentNode.querySelector('span'); return t.textContent.trim(); };
  var gekozen = times.getAttribute('data-gekozen') || '';
  function lock() {
    var met = val('met'), duur = val('duur'), tijd = val('tijd');
    steps[1].classList.toggle('is-locked', !met);
    steps[2].classList.toggle('is-locked', !met || !duur);
    steps[3].classList.toggle('is-locked', !met || !duur || !tijd);
    if (met && duur && val('datum') && tijd) {
      var d = new Date(val('datum') + 'T12:00:00');
      summary.textContent = label('met') + ', ' + d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) + ' om ' + tijd + ' (' + label('duur') + ')';
      summary.hidden = false;
    } else summary.hidden = true;
  }
  function laad() {
    var met = val('met'), duur = val('duur'), datum = val('datum');
    if (!met || !duur || !datum) return lock();
    fetch('/afspraak/tijden?met=' + met + '&duur=' + duur + '&datum=' + datum, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        times.textContent = '';
        if (!d.tijden.some(function (t) { return t.free; })) {
          var p = document.createElement('p'); p.className = 'plan__hint'; p.textContent = 'Op deze dag is er geen tijd meer vrij. Kies een andere dag.'; times.appendChild(p);
        } else d.tijden.forEach(function (t) {
          var l = document.createElement('label'), i = document.createElement('input'), s = document.createElement('span');
          l.className = 'time'; i.type = 'radio'; i.name = 'tijd'; i.value = t.time; i.required = true; i.disabled = !t.free;
          if (t.free && t.time === gekozen) i.checked = true;
          s.textContent = t.time; l.appendChild(i); l.appendChild(s); times.appendChild(l);
        });
        lock();
      })
      .catch(function () { lock(); });
  }
  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'tijd') { gekozen = e.target.value; lock(); }
    else if (n === 'met' || n === 'duur' || n === 'datum') laad();
  });
  var dag = form.querySelector('input[name="datum"]:checked');
  if (dag) dag.parentNode.scrollIntoView({ block: 'nearest', inline: 'center' });
  lock();
})();

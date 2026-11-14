import { html, raw, esc, MESSAGES } from '../lib.js';
import { all, one } from '../db.js';
import { SERVICES } from '../content.js';

export const SITE = (process.env.SITE_URL || 'https://studiofuente.nl').replace(/\/$/, '');
const LOGO = '/assets/img/site/Studio-Fuente-Logo-01.webp';

export function shopCategories() {
  return all(`SELECT c.slug, c.name, COUNT(p.id) n FROM categories c
    JOIN product_categories pc ON pc.category_id = c.id JOIN products p ON p.id = pc.product_id AND p.visible = 1
    WHERE c.parent_id IS NULL GROUP BY c.id HAVING n > 0 ORDER BY c.sort, c.name`);
}

export function cartCount(req) {
  if (!req.session) return 0;
  return one('SELECT COUNT(*) n FROM cart_items ci JOIN products p ON p.id = ci.product_id AND p.visible = 1 WHERE ci.session_id = ?', req.session.id).n;
}

export function layout(req, { title, description, body, hero = false, bodyClass = '', image, jsonld }) {
  const cats = shopCategories();
  const subs = all(`SELECT DISTINCT c.slug, c.name FROM categories c WHERE c.parent_id IS NOT NULL AND EXISTS (SELECT 1 FROM product_categories pc WHERE pc.category_id = c.id) GROUP BY c.name ORDER BY c.name`);
  const count = cartCount(req);
  const msg = MESSAGES[req.query?.melding];
  const user = req.user;
  return html`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? title + ' | Studio Fuente' : 'Studio Fuente | Interieurshowroom Amsterdam'}</title>
<meta name="description" content="${description || 'Tegels, sanitair, kasten op maat, stalen deuren en vloeren. Het complete interieur onder één dak, in onze showroom in Amsterdam.'}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23181613%22/%3E%3Ctext x=%2216%22 y=%2222%22 text-anchor=%22middle%22 font-family=%22Georgia%22 font-size=%2216%22 fill=%22%23f7f4ef%22%3ESF%3C/text%3E%3C/svg%3E">
<link rel="canonical" href="${SITE + req.path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Studio Fuente">
<meta property="og:title" content="${title || 'Studio Fuente | Interieurshowroom Amsterdam'}">
<meta property="og:description" content="${description || 'Het complete interieur, onder één dak.'}">
<meta property="og:image" content="${image ? (image.startsWith('http') ? image : SITE + image) : SITE + '/assets/web/hero.webp'}">
<meta property="og:url" content="${SITE + req.path}">
<meta name="theme-color" content="#f7f4ef">
${jsonld ? raw('<script type="application/ld+json">' + JSON.stringify(jsonld).replace(/</g, '\\u003c') + '</script>') : ''}
<style>
.loader { display: none; }
.has-loader .loader { display: flex; position: fixed; inset: 0; z-index: 9999; background: #181613; align-items: center; justify-content: center; flex-direction: column; gap: 34px; transition: transform 1.1s cubic-bezier(.7, 0, .2, 1); }
.has-loader body { overflow: hidden; }
.loader img { width: min(260px, 58vw); height: auto; filter: invert(1); opacity: 0; transform: translateY(10px); animation: loader-in 1s .15s cubic-bezier(.2, .7, .1, 1) forwards; }
.loader__line { width: min(260px, 58vw); height: 1px; background: rgba(247, 244, 239, .18); overflow: hidden; }
.loader__line i { display: block; height: 100%; background: #b89b78; transform: scaleX(0); transform-origin: left; animation: loader-line 1.5s .3s cubic-bezier(.4, 0, .2, 1) forwards; }
.loader.is-done { transform: translateY(-100%); }
@keyframes loader-in { to { opacity: 1; transform: none; } }
@keyframes loader-line { to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .loader, .loader img, .loader__line i { animation-duration: .01s; transition-duration: .3s; } }
</style>
<script>try { if (!sessionStorage.getItem('sf-geladen')) document.documentElement.classList.add('has-loader'); } catch (e) {}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=13">
</head>
<body class="${hero ? 'has-hero' : 'no-hero'} ${bodyClass}">

<div class="loader" id="loader" aria-hidden="true"><img src="${LOGO}" alt="" width="2479" height="417"><div class="loader__line"><i></i></div></div>
<script>(function () {
  var root = document.documentElement, el = document.getElementById('loader');
  if (!root.classList.contains('has-loader')) return;
  var start = Date.now(), klaar = false;
  function weg() {
    if (klaar) return; klaar = true;
    try { sessionStorage.setItem('sf-geladen', '1'); } catch (e) {}
    setTimeout(function () {
      el.classList.add('is-done');
      document.body.style.overflow = 'auto';
      setTimeout(function () { root.classList.remove('has-loader'); document.body.style.overflow = ''; }, 1200);
    }, Math.max(0, 1900 - (Date.now() - start)));
  }
  window.addEventListener('load', weg);
  setTimeout(weg, 4000);
})();</script>

<header class="nav${hero ? '' : ' is-solid'}" id="nav">
  <a class="nav__logo" href="/" aria-label="Studio Fuente, naar de homepage"><img src="${LOGO}" alt="Studio Fuente" width="2479" height="417"></a>
  <nav class="nav__links" aria-label="Hoofdmenu">
    <div class="nav__item" data-mega>
      <a href="/producten" aria-haspopup="true">Producten</a>
      <div class="mega">
        <div class="mega__inner wrap">
          <div class="mega__col">
            <form class="mega__search" action="/producten" role="search"><input type="search" name="q" placeholder="Zoek in de collectie" aria-label="Zoek producten"><button aria-label="Zoeken">&rarr;</button></form>
            <p class="mega__label">Webwinkel</p>
            <ul class="mega__list">${cats.map(c => html`<li><a href="/producten/${c.slug}">${c.name}<sup>${c.n}</sup></a></li>`)}</ul>
            <a class="link-line" href="/producten">Alle producten</a>
          </div>
          <div class="mega__col">
            <p class="mega__label">Merken</p>
            <ul class="mega__small">${subs.map(c => html`<li><a href="/producten/${c.slug}">${c.name}</a></li>`)}${['Muozo', 'Oppio'].map(b => html`<li><a href="/producten/wandpanelen?merk=${b}">${b}</a></li>`)}</ul>
          </div>
          <a class="mega__card" href="/producten/wandpanelen"><img src="/assets/web/wandpaneel-ribbel.webp" alt="" loading="lazy"><span>Nieuw</span><strong>Muozo wandpanelen</strong></a>
          <a class="mega__card" href="/producten/pvc-vloer"><img src="/assets/web/lib/pvc-wand-s.webp" alt="" loading="lazy"><span>Collectie</span><strong>PVC vloeren</strong></a>
        </div>
      </div>
    </div>
    <div class="nav__item" data-mega>
      <a href="/diensten" aria-haspopup="true">Diensten</a>
      <div class="mega">
        <div class="mega__inner wrap">
          <div class="mega__col mega__col--wide">
            <p class="mega__label">Wat we doen</p>
            <ul class="mega__list mega__list--cols">${SERVICES.map(sv => html`<li><a href="/diensten/${sv.slug}">${sv.name}</a></li>`)}</ul>
            <a class="link-line" href="/diensten">Alle diensten en werkwijze</a>
          </div>
          <a class="mega__card" href="/diensten/kasten-op-maat"><img src="/assets/web/clips/decolegno-45.jpg" alt="" loading="lazy" style="object-position:50% 40%"><span>Maatwerk</span><strong>Kasten op maat</strong></a>
          <a class="mega__card" href="/afspraak"><img src="/assets/web/lib/showroom-lounge-s.webp" alt="" loading="lazy"><span>Showroom</span><strong>Plan een bezoek</strong></a>
        </div>
      </div>
    </div>
    <div class="nav__item"><a href="/showroom">Showroom</a></div>
    <div class="nav__item"><a href="/journaal">Journaal</a></div>
    <div class="nav__item"><a href="/contact">Contact</a></div>
  </nav>
  <div class="nav__tools">
    <a class="nav__tool" href="${user ? (user.role === 'beheerder' ? '/beheer' : '/account') : '/account/inloggen'}">${user ? (user.role === 'beheerder' ? 'Beheer' : 'Account') : 'Inloggen'}</a>
    <a class="nav__tool nav__cart" href="/winkelmand" data-cart-open>Winkelmand <span class="nav__count" data-cart-count>${count}</span></a>
    <a class="nav__cta" href="/afspraak">Afspraak maken</a>
  </div>
  <button class="nav__toggle" aria-label="Menu openen" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <form class="menu__search" action="/producten" role="search"><input type="search" name="q" placeholder="Zoek in de collectie" aria-label="Zoek producten"><button aria-label="Zoeken">&rarr;</button></form>
  <a href="/producten">Producten</a>
  <a href="/diensten">Diensten</a>
  <a href="/showroom">Showroom</a>
  <a href="/journaal">Journaal</a>
  <a href="/contact">Contact</a>
  <a href="/winkelmand">Winkelmand (<span data-cart-count>${count}</span>)</a>
  <a href="${user ? '/account' : '/account/inloggen'}">${user ? 'Mijn account' : 'Inloggen'}</a>
  <a href="/afspraak" class="menu__cta">Afspraak maken</a>
  <p class="menu__meta">Sierenborch 4, Amsterdam<br><a href="tel:+31203033499">020 303 3499</a></p>
</div>

${msg ? html`<div class="toast is-on" role="status">${msg}</div>` : ''}

<main id="top">${body}</main>

<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <img src="${LOGO}" alt="Studio Fuente" width="2479" height="417">
      <p>Het complete interieur, onder één dak.</p>
    </div>
    <div>
      <h4>Winkel</h4>
      <p>${cats.slice(0, 4).map(c => html`<a href="/producten/${c.slug}">${c.name}</a><br>`)}<a href="/producten">Alle producten</a></p>
    </div>
    <div>
      <h4>Studio</h4>
      <p><a href="/diensten">Diensten</a><br><a href="/showroom">Showroom</a><br><a href="/journaal">Journaal</a><br><a href="/afspraak">Afspraak maken</a><br><a href="/contact">Contact</a><br><a href="/account">Mijn account</a></p>
    </div>
    <div>
      <h4>Contact</h4>
      <p><a href="https://maps.google.com/?q=Sierenborch+4,+1043+BA+Amsterdam" target="_blank" rel="noopener">Sierenborch 4<br>1043 BA Amsterdam</a><br><a href="tel:+31203033499">020 303 3499</a><br><a href="mailto:info@studiofuente.nl">info@studiofuente.nl</a></p>
    </div>
  </div>
  <div class="wrap footer__base">
    <span>&copy; ${new Date().getFullYear()} Studio Fuente</span>
    <span class="footer__links"><a href="https://www.instagram.com/studiofuente/" target="_blank" rel="noopener">Instagram</a><a href="https://www.facebook.com/profile.php?id=61577575230191" target="_blank" rel="noopener">Facebook</a><a href="/algemene-voorwaarden">Algemene voorwaarden</a><a href="/privacy">Privacy</a></span>
  </div>
</footer>

<aside class="drawer" id="drawer" aria-hidden="true" aria-label="Winkelmand">
  <div class="drawer__shade" data-cart-close></div>
  <div class="drawer__panel">
    <div class="drawer__head"><h3>Winkelmand</h3><button data-cart-close aria-label="Sluiten">Sluiten</button></div>
    <div class="drawer__body" data-cart-body></div>
  </div>
</aside>

<script src="/main.js?v=8" defer></script>
</body>
</html>`;
}

export const pageHead = (eyebrow, title, intro) => html`
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${intro ? html`<p class="lead">${intro}</p>` : ''}
  </div>
</section>`;

export const em = s => raw(esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>'));

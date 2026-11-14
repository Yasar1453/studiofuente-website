import { html, raw, money, unitLabel, ORDER_STATUS, dateNl } from '../lib.js';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { ROOT } from '../db.js';
import { layout, em, SITE } from './layout.js';
import { CATEGORY_BANNERS } from '../content.js';

export const imgSrc = im => im ? (im.local_path ? '/' + im.local_path : im.remote_url) : '/assets/web/stalen.webp';
// Kleine versie (640 px) voor overzichten, als die bestaat
const thumbCache = new Map();
export const thumbSrc = im => {
  if (!im?.local_path) return imgSrc(im);
  const t = 'assets/products/t/' + path.basename(im.local_path).replace(/\.[a-z]+$/i, '.webp');
  if (!thumbCache.has(t)) thumbCache.set(t, existsSync(path.join(ROOT, 'public', t)));
  return thumbCache.get(t) ? '/' + t : imgSrc(im);
};

export const productCard = p => html`
<a class="card reveal" href="/product/${p.slug}">
  <div class="card__img">
    <img src="${thumbSrc(p.img)}" alt="${p.name}" loading="lazy">
    ${p.img2 ? html`<img class="card__alt" src="${thumbSrc(p.img2)}" alt="" loading="lazy">` : ''}
    ${p.stock_status === 'outofstock' ? html`<span class="card__tag">Op bestelling</span>` : ''}
  </div>
  <div class="card__body">
    ${p.brand ? html`<p class="card__brand">${p.brand}</p>` : ''}
    <h3 class="card__name">${p.name}</h3>
    <p class="card__price">${p.price ? html`${money(p.price)} <span>${unitLabel(p.unit)}</span>` : 'Prijs op aanvraag'}</p>
  </div>
</a>`;

const SORTS = { populair: 'Aanbevolen', nieuw: 'Nieuwste', 'prijs-op': 'Prijs laag naar hoog', 'prijs-af': 'Prijs hoog naar laag', naam: 'Naam A-Z' };

export function productList(req, { cats, current, sub, brands, products, total, page, pages, q, sort, merk }) {
  const base = '/producten' + (current ? '/' + current.slug : '');
  const qs = (extra = {}) => {
    const p = new URLSearchParams({ ...(q ? { q } : {}), ...(sort && sort !== 'populair' ? { sort } : {}), ...(merk ? { merk } : {}), ...extra });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? '?' + s : '';
  };
  const title = current ? current.name : (q ? `Zoeken: ${q}` : 'Alle producten');
  return layout(req, {
    title,
    description: current ? `${current.name} van Studio Fuente. Bekijk de collectie online of in onze showroom in Amsterdam.` : 'De collectie van Studio Fuente: tegels, PVC vloeren en wandpanelen.',
    body: html`
<section class="shop-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="Kruimelpad"><a href="/">Home</a><span>/</span><a href="/producten">Producten</a>${current ? html`<span>/</span><span>${current.name}</span>` : ''}</nav>
    <div class="shop-head__row">
      <h1>${current ? em(current.name) : em(q ? 'Zoekresultaten' : 'De *collectie*')}</h1>
      <p class="shop-head__count">${total} ${total === 1 ? 'product' : 'producten'}</p>
    </div>
    ${!q ? html`<figure class="shop-banner"><img src="${CATEGORY_BANNERS[current?.slug] || CATEGORY_BANNERS._alles}" alt="" fetchpriority="high"></figure>` : ''}
    <div class="cats" role="navigation" aria-label="Categorieën">
      <a href="/producten${qs({ merk: '' })}" class="${!current ? 'is-on' : ''}">Alles</a>
      ${cats.map(c => html`<a href="/producten/${c.slug}" class="${current?.id === c.id || current?.parent_id === c.id ? 'is-on' : ''}">${c.name}<sup>${c.n}</sup></a>`)}
    </div>
  </div>
</section>
<section class="shop wrap">
  <form class="toolbar" method="get" action="${base}">
    <label class="toolbar__search"><span class="sr">Zoeken</span><input type="search" name="q" value="${q}" placeholder="Zoek op naam, kleur of merk"></label>
    ${sub.length ? html`<div class="toolbar__subs">${sub.map(s => html`<a href="/producten/${s.slug}" class="${current?.id === s.id ? 'is-on' : ''}">${s.name}</a>`)}</div>` : ''}
    ${brands.length > 1 ? html`<label class="toolbar__select"><span>Merk</span><select name="merk" data-autosubmit><option value="">Alle merken</option>${brands.map(b => html`<option${b === merk ? raw(' selected') : ''}>${b}</option>`)}</select></label>` : ''}
    <label class="toolbar__select"><span>Sorteer</span><select name="sort" data-autosubmit>${Object.entries(SORTS).map(([k, v]) => html`<option value="${k}"${k === sort ? raw(' selected') : ''}>${v}</option>`)}</select></label>
    <noscript><button class="btn btn--small">Toon</button></noscript>
  </form>
  ${products.length ? html`<div class="grid grid--4">${products.map(productCard)}</div>` : html`
    <div class="empty"><h2>${em('Niets *gevonden*')}</h2><p>Probeer een andere zoekterm, of vraag het ons in de showroom.</p><a class="link-line" href="/producten">Alle producten</a></div>`}
  ${pages > 1 ? html`<nav class="pager" aria-label="Pagina's">
    ${page > 1 ? html`<a href="${base}${qs({ pagina: page - 1 })}" aria-label="Vorige">&larr;</a>` : ''}
    ${Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1).map((n, i, arr) => html`${i && n - arr[i - 1] > 1 ? html`<span>…</span>` : ''}<a href="${base}${qs({ pagina: n > 1 ? n : '' })}" class="${n === page ? 'is-on' : ''}">${n}</a>`)}
    ${page < pages ? html`<a href="${base}${qs({ pagina: page + 1 })}" aria-label="Volgende">&rarr;</a>` : ''}
  </nav>` : ''}
</section>`,
  });
}

function packSize(specs) {
  const s = specs.find(([k]) => /pakinhoud|inhoud per (pak|doos)|m² per (pak|doos)/i.test(k));
  const m = s && s[1].replace(',', '.').match(/([\d.]+)\s*m/);
  return m ? parseFloat(m[1]) : null;
}

export function productDetail(req, { p, images, cats, related }) {
  const specs = JSON.parse(p.specs || '[]');
  const pack = packSize(specs);
  const main = cats[0];
  return layout(req, {
    title: p.name,
    image: imgSrc(images[0]),
    jsonld: { '@context': 'https://schema.org', '@type': 'Product', name: p.name, ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}), ...(p.sku ? { sku: p.sku } : {}),
      image: images.map(imgSrc).map(u => u.startsWith('http') ? u : SITE + u),
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: (p.price / 100).toFixed(2), availability: p.stock_status === 'instock' ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', url: SITE + '/product/' + p.slug } },
    description: `${p.name}${p.brand ? ' van ' + p.brand : ''}. ${money(p.price)} ${unitLabel(p.unit)}. Bestel online of bekijk in onze showroom in Amsterdam.`,
    body: html`
<section class="pdp wrap">
  <nav class="crumbs" aria-label="Kruimelpad"><a href="/">Home</a><span>/</span><a href="/producten">Producten</a>${main ? html`<span>/</span><a href="/producten/${main.slug}">${main.name}</a>` : ''}</nav>
  <div class="pdp__grid">
    <div class="pdp__gallery" data-gallery>
      <div class="pdp__main"><img src="${imgSrc(images[0])}" alt="${p.name}" data-gallery-main></div>
      ${images.length > 1 ? html`<div class="pdp__thumbs">${images.map((im, i) => html`<button class="${i ? '' : 'is-on'}" data-src="${imgSrc(im)}" aria-label="Foto ${i + 1}"><img src="${thumbSrc(im)}" alt="" loading="lazy"></button>`)}</div>` : ''}
    </div>
    <div class="pdp__info">
      ${p.brand ? html`<p class="eyebrow">${p.brand}</p>` : ''}
      <h1>${p.name}</h1>
      <p class="pdp__price">${p.price ? html`${money(p.price)} <span>${unitLabel(p.unit)} &nbsp;·&nbsp; incl. btw</span>` : 'Prijs op aanvraag'}</p>
      ${p.regular_price && p.regular_price > p.price ? html`<p class="pdp__was">Was ${money(p.regular_price)}</p>` : ''}
      ${p.description ? html`<p class="pdp__desc">${p.description}</p>` : ''}

      ${!p.price ? html`<div class="buy"><a class="btn btn--block" href="/contact?onderwerp=${encodeURIComponent('Vraag over een product')}&product=${encodeURIComponent(p.name)}">Vraag de prijs aan</a></div>` : ''}
      ${p.price ? html`<form class="buy" method="post" action="/winkelmand/toevoegen" data-add-to-cart>
        <input type="hidden" name="product" value="${p.id}">
        ${(pack || p.unit === 'm²') ? html`
        <div class="calc" data-calc data-pack="${pack || ''}" data-unit="${p.unit}" data-price="${p.price}">
          <label><span>Hoeveel m² heb je nodig?</span><input type="number" min="0" step="0.5" inputmode="decimal" placeholder="Bijv. 24" data-calc-m2></label>
          <label class="calc__waste"><input type="checkbox" checked data-calc-waste> 10% extra voor zaagverlies</label>
          <p class="calc__out" data-calc-out></p>
        </div>` : ''}
        <div class="buy__row">
          <div class="qty"><button type="button" data-qty="-1" aria-label="Minder">−</button><input name="aantal" type="number" min="1" max="999" value="1" aria-label="Aantal (${p.unit})" data-qty-input><button type="button" data-qty="1" aria-label="Meer">+</button></div>
          <button class="btn buy__btn" type="submit">In winkelmand <span data-buy-total>${money(p.price)}</span></button>
        </div>
        <p class="buy__unit">Aantal in ${p.unit === 'pak' ? 'pakken' : p.unit === 'm²' ? 'm²' : 'stuks'}${pack ? html` &nbsp;·&nbsp; 1 pak = ${String(pack).replace('.', ',')} m²` : ''}</p>
      </form>` : ''}

      <ul class="pdp__usp">
        <li>Bekijk en voel dit materiaal in onze showroom</li>
        <li>Persoonlijk advies over legpatroon en afwerking</li>
        <li>Bezorgen of ophalen aan de Sierenborch in Amsterdam</li>
      </ul>
      ${specs.length ? html`<dl class="specs">${specs.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>` : ''}
      <a class="link-line" href="/afspraak?onderwerp=${encodeURIComponent(main?.name || 'Tegels')}">Liever eerst zien? Plan een afspraak</a>
    </div>
  </div>
</section>
${related.length ? html`<section class="featured featured--tight"><div class="wrap">
  <div class="section-head section-head--row"><div><p class="eyebrow">Combineer met</p><h2>${em('Meer uit *deze collectie*')}</h2></div>${main ? html`<a class="link-line" href="/producten/${main.slug}">Alles in ${main.name}</a>` : ''}</div>
  <div class="grid grid--4">${related.map(productCard)}</div></div></section>` : ''}`,
  });
}

export const cartLines = (lines, { compact = false } = {}) => html`
<ul class="lines${compact ? ' lines--compact' : ''}">
  ${lines.map(l => html`<li class="line">
    <a class="line__img" href="/product/${l.slug}"><img src="${thumbSrc(l.img)}" alt="" loading="lazy"></a>
    <div class="line__info">
      <a href="/product/${l.slug}" class="line__name">${l.name}</a>
      <p class="line__meta">${money(l.price)} ${unitLabel(l.unit)}</p>
      <form class="line__qty" method="post" action="/winkelmand/bijwerken" data-cart-update>
        <input type="hidden" name="product" value="${l.product_id}">
        <button type="submit" class="sr" tabindex="-1">Bijwerken</button>
        <div class="qty qty--small"><button type="submit" name="aantal" value="${l.qty - 1}" aria-label="Minder">−</button><input name="invoer" type="number" min="0" max="999" value="${l.qty}" aria-label="Aantal" data-cart-qty><button type="submit" name="aantal" value="${l.qty + 1}" aria-label="Meer">+</button></div>
        <button class="line__remove" type="submit" name="aantal" value="0">Verwijderen</button>
      </form>
    </div>
    <p class="line__total">${money(l.price * l.qty)}</p>
  </li>`)}
</ul>`;

export const cartSummary = (cart, cta = true) => html`
<div class="summary">
  <div class="summary__row"><span>Subtotaal</span><span>${money(cart.subtotal)}</span></div>
  <div class="summary__row"><span>Bezorgen</span><span>Na bestelling in overleg</span></div>
  <div class="summary__row summary__total"><span>Totaal <small>incl. btw</small></span><span>${money(cart.subtotal)}</span></div>
  ${cta ? html`<a class="btn btn--block" href="/afrekenen">Verder naar afrekenen</a><a class="summary__more" href="/producten">Verder winkelen</a>` : ''}
</div>`;

export function cartDrawer(cart) {
  if (!cart.lines.length) return html`<div class="drawer__empty"><p>Je winkelmand is nog leeg.</p><a class="link-line" href="/producten">Bekijk de collectie</a></div>`;
  return html`${cartLines(cart.lines, { compact: true })}${cartSummary(cart)}`;
}

export function cartPage(req, cart) {
  return layout(req, {
    title: 'Winkelmand',
    body: html`
<section class="shop-head"><div class="wrap"><nav class="crumbs"><a href="/">Home</a><span>/</span><span>Winkelmand</span></nav><h1>${em('Je *winkelmand*')}</h1></div></section>
<section class="wrap cart">
  ${cart.lines.length ? html`
  <div class="cart__grid">
    <div>${cartLines(cart.lines)}</div>
    <aside>${cartSummary(cart)}</aside>
  </div>` : html`<div class="empty"><h2>${em('Nog *leeg*')}</h2><p>Je hebt nog niets in je winkelmand gelegd.</p><a class="btn" href="/producten">Bekijk de collectie</a></div>`}
</section>`,
  });
}

export function checkoutPage(req, { cart, values = {}, errors = {}, paymentsEnabled }) {
  const u = req.user || {};
  const v = { email: u.email, voornaam: u.first_name, achternaam: u.last_name, telefoon: u.phone, bedrijf: u.company, straat: u.street, postcode: u.postcode, plaats: u.city, levering: 'bezorgen', ...values };
  const f = (name, label, opts = {}) => html`<label class="${opts.full ? 'full' : ''}"><span>${label}${opts.optional ? html` <small>(optioneel)</small>` : ''}</span>
    <input name="${name}" type="${opts.type || 'text'}" value="${v[name] || ''}" autocomplete="${opts.ac || 'on'}" ${opts.optional ? '' : raw('required')} class="${errors[name] ? 'is-invalid' : ''}"></label>`;
  return layout(req, {
    title: 'Afrekenen',
    body: html`
<section class="shop-head"><div class="wrap"><nav class="crumbs"><a href="/winkelmand">Winkelmand</a><span>/</span><span>Afrekenen</span></nav><h1>${em('*Afrekenen*')}</h1></div></section>
<section class="wrap checkout">
  <form class="checkout__grid" method="post" action="/afrekenen" novalidate>
    <div class="checkout__form">
      ${!req.user ? html`<div class="notice">Heb je al een account? <a href="/account/inloggen?terug=/afrekenen">Log in</a> om je gegevens in te vullen en je bestelling later terug te zien.</div>` : ''}
      ${Object.keys(errors).length ? html`<div class="notice notice--error">Controleer de gemarkeerde velden.</div>` : ''}
      <fieldset><legend><span>01</span>Contact</legend>
        <div class="fields">
          ${f('email', 'E-mail', { type: 'email', ac: 'email', full: true })}
          ${f('voornaam', 'Voornaam', { ac: 'given-name' })}${f('achternaam', 'Achternaam', { ac: 'family-name' })}
          ${f('telefoon', 'Telefoon', { type: 'tel', ac: 'tel' })}${f('bedrijf', 'Bedrijf', { optional: true, ac: 'organization' })}
        </div>
      </fieldset>
      <fieldset><legend><span>02</span>Levering</legend>
        <div class="choice">
          <label><input type="radio" name="levering" value="bezorgen" ${v.levering !== 'ophalen' ? raw('checked') : ''} data-delivery><span><strong>Bezorgen</strong>Bezorgkosten stemmen we met je af</span></label>
          <label><input type="radio" name="levering" value="ophalen" ${v.levering === 'ophalen' ? raw('checked') : ''} data-delivery><span><strong>Ophalen in de showroom</strong>Sierenborch 4, Amsterdam</span></label>
        </div>
        <div class="fields" data-address>
          ${f('straat', 'Straat en huisnummer', { full: true, ac: 'street-address' })}
          ${f('postcode', 'Postcode', { ac: 'postal-code' })}${f('plaats', 'Plaats', { ac: 'address-level2' })}
        </div>
      </fieldset>
      <fieldset><legend><span>03</span>Opmerking</legend>
        <label class="full"><span>Bijvoorbeeld een gewenste leverdatum <small>(optioneel)</small></span><textarea name="opmerking" rows="3">${v.opmerking || ''}</textarea></label>
      </fieldset>
      ${!req.user ? html`<fieldset><legend><span>04</span>Account</legend>
        <label class="check"><input type="checkbox" name="account" value="1" ${v.account ? raw('checked') : ''} data-account> Maak een account aan om je bestellingen te volgen</label>
        <div class="fields" data-password ${v.account ? '' : raw('hidden')}><label class="full"><span>Kies een wachtwoord <small>(minimaal 8 tekens)</small></span><input type="password" name="wachtwoord" autocomplete="new-password" minlength="8" class="${errors.wachtwoord ? 'is-invalid' : ''}"></label></div>
      </fieldset>` : ''}
    </div>
    <aside class="checkout__side">
      <h2 class="checkout__title">Je bestelling</h2>
      ${cart.lines.map(l => html`<div class="mini"><img src="${thumbSrc(l.img)}" alt=""><div><p>${l.name}</p><span>${l.qty} × ${money(l.price)}</span></div><strong>${money(l.qty * l.price)}</strong></div>`)}
      ${cartSummary(cart, false)}
      <label class="check"><input type="checkbox" name="voorwaarden" value="1" required ${v.voorwaarden ? raw('checked') : ''}> <span class="${errors.voorwaarden ? 'is-invalid-text' : ''}">Ik ga akkoord met de <a href="/algemene-voorwaarden" target="_blank">algemene voorwaarden</a></span></label>
      ${paymentsEnabled ? html`<button class="btn btn--block" type="submit">Betalen met iDEAL</button>` : html`
        <div class="notice notice--soft"><strong>Online betalen volgt binnenkort.</strong> We koppelen Mollie (iDEAL, creditcard, Bancontact). Plaats je bestelling nu, dan nemen wij contact op over de betaling.</div>
        <button class="btn btn--block" type="submit">Bestelling plaatsen</button>`}
      <p class="checkout__safe">Je gegevens gebruiken we alleen voor deze bestelling. <a href="/privacy">Privacy</a></p>
    </aside>
  </form>
</section>`,
  });
}

export function orderTimeline(order, events) {
  return html`<ol class="timeline">${events.map(e => html`<li><span>${new Date(e.created_at.replace(' ', 'T') + 'Z').toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>${e.text}</li>`)}</ol>`;
}

export function orderView(order, items, events, { heading } = {}) {
  return html`
<div class="order">
  <div class="order__head">
    <div><p class="eyebrow">Bestelling ${order.number}</p><h2>${heading || em(ORDER_STATUS[order.status] || order.status)}</h2></div>
    <p class="order__date">${dateNl(order.created_at)}</p>
  </div>
  <div class="order__grid">
    <div>
      <ul class="lines lines--compact">${items.map(i => html`<li class="line line--static"><div class="line__info"><p class="line__name">${i.name}</p><p class="line__meta">${i.qty} × ${money(i.price)} ${unitLabel(i.unit)}</p></div><p class="line__total">${money(i.qty * i.price)}</p></li>`)}</ul>
      <div class="summary summary--flat">
        <div class="summary__row"><span>Subtotaal</span><span>${money(order.subtotal)}</span></div>
        <div class="summary__row"><span>${order.delivery === 'ophalen' ? 'Ophalen in showroom' : 'Bezorgen'}</span><span>${order.shipping ? money(order.shipping) : (order.delivery === 'ophalen' ? 'Gratis' : 'In overleg')}</span></div>
        <div class="summary__row summary__total"><span>Totaal <small>incl. btw</small></span><span>${money(order.total)}</span></div>
      </div>
    </div>
    <div class="order__side">
      <h4>${order.delivery === 'ophalen' ? 'Ophalen' : 'Bezorgadres'}</h4>
      <p>${order.first_name} ${order.last_name}${order.company ? html`<br>${order.company}` : ''}<br>${order.delivery === 'ophalen' ? html`Showroom Studio Fuente<br>Sierenborch 4, Amsterdam` : html`${order.street}<br>${order.postcode} ${order.city}`}</p>
      <h4>Betaling</h4>
      <p>${order.payment_status === 'betaald' ? 'Betaald' : 'Nog niet betaald. Wij nemen contact met je op.'}</p>
      ${events.length ? html`<h4>Verloop</h4>${orderTimeline(order, events)}` : ''}
    </div>
  </div>
</div>`;
}

export function orderDone(req, { order, items, events }) {
  return layout(req, {
    title: 'Bestelling ontvangen',
    body: html`
<section class="shop-head"><div class="wrap"><p class="eyebrow">Dank je wel</p><h1>${em('Je bestelling is\n*ontvangen*')}</h1>
<p class="lead">We hebben je bestelling vastgelegd onder nummer <strong>${order.number}</strong>. Online betalen via Mollie wordt binnenkort gekoppeld. Tot die tijd nemen wij binnen één werkdag contact met je op over de betaling en de levering.</p></div></section>
<section class="wrap" style="padding-bottom:120px">
  ${orderView(order, items, events, { heading: 'Overzicht' })}
  <div class="order__actions">${req.user ? html`<a class="btn" href="/account">Naar mijn account</a>` : html`<a class="btn" href="/account/registreren?email=${encodeURIComponent(order.email)}">Account aanmaken</a>`}<a class="link-line" href="/producten">Verder winkelen</a></div>
</section>`,
  });
}

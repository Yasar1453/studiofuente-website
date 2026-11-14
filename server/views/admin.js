import { html, raw, money, dateNl, dateTimeNl, unitLabel, ORDER_STATUS, MESSAGES } from '../lib.js';
import { imgSrc, thumbSrc } from './shop.js';
import { statusPill } from './account.js';

const NAV = [['/beheer', 'Overzicht', 'overzicht'], ['/beheer/bestellingen', 'Bestellingen', 'bestellingen'], ['/beheer/producten', 'Producten', 'producten'], ['/beheer/klanten', 'Klanten', 'klanten'], ['/beheer/afspraken', 'Afspraken & vragen', 'afspraken']];

export function adminLayout(req, active, title, body, { badges = {} } = {}) {
  const msg = MESSAGES[req.query?.melding];
  return html`<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Beheer Studio Fuente</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/admin.css?v=3">
</head><body class="adm">
<aside class="adm__side">
  <a class="adm__logo" href="/beheer"><img src="/assets/img/site/Studio-Fuente-Logo-01.webp" alt="Studio Fuente"><span>Beheer</span></a>
  <nav>${NAV.map(([href, label, key]) => html`<a href="${href}" class="${active === key ? 'is-on' : ''}">${label}${badges[key] ? html`<b>${badges[key]}</b>` : ''}</a>`)}</nav>
  <div class="adm__foot">
    <a href="/" target="_blank">Website bekijken ↗</a>
    <span>${req.user.email}</span>
    <form method="post" action="/account/uitloggen"><button>Uitloggen</button></form>
  </div>
</aside>
<main class="adm__main">
  ${msg ? html`<div class="adm__toast">${msg}</div>` : ''}
  <header class="adm__head"><h1>${title}</h1></header>
  ${body}
</main>
<script>document.addEventListener('click',e=>{const tr=e.target.closest('tr[data-href]');if(tr&&!e.target.closest('a,button,select,input,form'))location.href=tr.dataset.href;});</script>
</body></html>`;
}

export function dashboard(req, d) {
  return adminLayout(req, 'overzicht', 'Overzicht', html`
<div class="kpis">
  <div class="kpi"><span>Omzet deze maand</span><strong>${money(d.revenueMonth)}</strong><small>${d.ordersMonth} bestellingen</small></div>
  <div class="kpi"><span>Open bestellingen</span><strong>${d.open}</strong><small>wachten op actie</small></div>
  <div class="kpi"><span>Nieuwe afspraken</span><strong>${d.newAppointments}</strong><small>nog niet ingepland</small></div>
  <div class="kpi"><span>Klanten</span><strong>${d.customers}</strong><small>${d.products} producten online</small></div>
</div>
${d.legalTodo ? html`<div class="adm__note"><strong>Voorwaarden en privacy:</strong> het KvK-nummer ontbreekt (ook op de huidige live site). Vul het aan voordat de site live gaat.</div>` : ''}
${d.paymentsOff ? html`<div class="adm__note"><strong>Online betalen staat uit.</strong> Mollie is nog niet gekoppeld. Klanten kunnen bestellen; de status blijft “Wacht op betaling” tot je de betaling zelf registreert. Zet <code>MOLLIE_API_KEY</code> in <code>.env</code> om te koppelen.</div>` : ''}
<div class="adm__cols">
  <section class="panel"><div class="panel__head"><h2>Laatste bestellingen</h2><a href="/beheer/bestellingen">Alles</a></div>
    ${d.recentOrders.length ? ordersTable(d.recentOrders) : html`<p class="muted">Nog geen bestellingen.</p>`}
  </section>
  <section class="panel"><div class="panel__head"><h2>Afspraakaanvragen</h2><a href="/beheer/afspraken">Alles</a></div>
    ${d.recentAppointments.length ? html`<ul class="list">${d.recentAppointments.map(a => html`<li><div><strong>${a.name}</strong><span>${a.topic} · ${a.preferred || ''}</span></div><span class="pill pill--${a.status}">${a.status}</span></li>`)}</ul>` : html`<p class="muted">Nog geen aanvragen.</p>`}
  </section>
</div>`, { badges: d.badges });
}

const ordersTable = orders => html`<table class="tbl"><thead><tr><th>Nummer</th><th>Klant</th><th>Datum</th><th>Status</th><th class="num">Totaal</th></tr></thead><tbody>
${orders.map(o => html`<tr data-href="/beheer/bestellingen/${o.number}"><td><a href="/beheer/bestellingen/${o.number}">${o.number}</a></td><td>${o.first_name} ${o.last_name}<small>${o.email}</small></td><td>${dateTimeNl(o.created_at)}</td><td>${statusPill(o.status)}</td><td class="num">${money(o.total)}</td></tr>`)}
</tbody></table>`;

export function ordersPage(req, { orders, status, counts, q }) {
  return adminLayout(req, 'bestellingen', 'Bestellingen', html`
<div class="filters">
  <a href="/beheer/bestellingen" class="${!status ? 'is-on' : ''}">Alle <b>${counts.all}</b></a>
  ${Object.entries(ORDER_STATUS).map(([k, v]) => counts[k] ? html`<a href="/beheer/bestellingen?status=${k}" class="${status === k ? 'is-on' : ''}">${v} <b>${counts[k]}</b></a>` : '')}
  <form method="get"><input type="hidden" name="status" value="${status || ''}"><input type="search" name="q" value="${q || ''}" placeholder="Zoek op nummer, naam of e-mail"></form>
</div>
<section class="panel">${orders.length ? ordersTable(orders) : html`<p class="muted">Geen bestellingen gevonden.</p>`}</section>`);
}

export function orderPage(req, { order, items, events, customer }) {
  return adminLayout(req, 'bestellingen', `Bestelling ${order.number}`, html`
<a class="back" href="/beheer/bestellingen">&larr; Bestellingen</a>
<div class="adm__cols adm__cols--wide">
  <section class="panel">
    <div class="panel__head"><h2>Producten</h2>${statusPill(order.status)}</div>
    <table class="tbl"><thead><tr><th>Product</th><th class="num">Aantal</th><th class="num">Prijs</th><th class="num">Totaal</th></tr></thead><tbody>
    ${items.map(i => html`<tr><td>${i.product_id ? html`<a href="/beheer/producten/${i.product_id}">${i.name}</a>` : i.name}</td><td class="num">${i.qty} ${i.unit}</td><td class="num">${money(i.price)}</td><td class="num">${money(i.qty * i.price)}</td></tr>`)}
    </tbody><tfoot><tr><td colspan="3">Subtotaal</td><td class="num">${money(order.subtotal)}</td></tr><tr><td colspan="3">Verzending</td><td class="num">${money(order.shipping)}</td></tr><tr class="strong"><td colspan="3">Totaal incl. btw</td><td class="num">${money(order.total)}</td></tr></tfoot></table>
    ${order.note ? html`<div class="adm__quote"><span>Opmerking klant</span>${order.note}</div>` : ''}
  </section>
  <div>
    <section class="panel">
      <h2>Status bijwerken</h2>
      <form method="post" action="/beheer/bestellingen/${order.number}" class="adm-form">
        <label>Status<select name="status">${Object.entries(ORDER_STATUS).map(([k, v]) => html`<option value="${k}"${k === order.status ? raw(' selected') : ''}>${v}</option>`)}</select></label>
        <label>Betaling<select name="betaling">${[['open', 'Open'], ['betaald', 'Betaald'], ['terugbetaald', 'Terugbetaald']].map(([k, v]) => html`<option value="${k}"${k === order.payment_status ? raw(' selected') : ''}>${v}</option>`)}</select></label>
        <label>Verzendkosten (€)<input name="verzendkosten" inputmode="decimal" value="${(order.shipping / 100).toFixed(2).replace('.', ',')}"></label>
        <label>Notitie voor de klant <small>(zichtbaar in account)</small><textarea name="notitie" rows="2" placeholder="Bijv. Levering staat gepland op vrijdag"></textarea></label>
        <button class="abtn">Opslaan</button>
      </form>
    </section>
    <section class="panel">
      <h2>Klant</h2>
      <p>${order.first_name} ${order.last_name}${order.company ? html`<br>${order.company}` : ''}<br><a href="mailto:${order.email}">${order.email}</a><br>${order.phone ? html`<a href="tel:${order.phone}">${order.phone}</a>` : ''}</p>
      <p class="muted">${order.delivery === 'ophalen' ? 'Ophalen in de showroom' : html`${order.street}<br>${order.postcode} ${order.city}`}</p>
      ${customer ? html`<a href="/beheer/klanten/${customer.id}">Klantprofiel</a>` : html`<span class="muted">Gast (geen account)</span>`}
    </section>
    <section class="panel">
      <h2>Verloop</h2>
      <ol class="tl">${events.map(e => html`<li><span>${dateTimeNl(e.created_at)}</span>${e.text}</li>`)}</ol>
    </section>
  </div>
</div>`);
}

export function productsPage(req, { products, total, page, pages, q, cat, cats, vis }) {
  const qs = extra => '?' + new URLSearchParams(Object.entries({ q, cat, vis, ...extra }).filter(([, v]) => v)).toString();
  return adminLayout(req, 'producten', 'Producten', html`
<div class="filters">
  <form method="get" class="filters__form">
    <input type="search" name="q" value="${q || ''}" placeholder="Zoek product of SKU">
    <select name="cat" onchange="this.form.submit()"><option value="">Alle categorieën</option>${cats.map(c => html`<option value="${c.id}"${String(c.id) === String(cat) ? raw(' selected') : ''}>${c.parent_id ? '— ' : ''}${c.name}</option>`)}</select>
    <select name="vis" onchange="this.form.submit()"><option value="">Alle</option><option value="1"${vis === '1' ? raw(' selected') : ''}>Online</option><option value="0"${vis === '0' ? raw(' selected') : ''}>Verborgen</option></select>
  </form>
  <span class="muted">${total} producten</span>
</div>
<section class="panel">
<table class="tbl tbl--products"><thead><tr><th></th><th>Product</th><th>Categorie</th><th class="num">Prijs</th><th>Online</th></tr></thead><tbody>
${products.map(p => html`<tr data-href="/beheer/producten/${p.id}"><td><img src="${thumbSrc(p.img)}" alt="" loading="lazy"></td><td><a href="/beheer/producten/${p.id}">${p.name}</a><small>${p.brand || ''} ${p.sku ? '· ' + p.sku : ''}</small></td><td>${p.cats || ''}</td><td class="num">${money(p.price)}<small>${unitLabel(p.unit)}</small></td>
<td><form method="post" action="/beheer/producten/${p.id}/zichtbaar"><button class="toggle ${p.visible ? 'is-on' : ''}" aria-label="${p.visible ? 'Verbergen' : 'Online zetten'}"><span></span></button></form></td></tr>`)}
</tbody></table>
${pages > 1 ? html`<nav class="apager">${page > 1 ? html`<a href="${qs({ pagina: page - 1 })}">&larr; Vorige</a>` : html`<span></span>`}<span>Pagina ${page} van ${pages}</span>${page < pages ? html`<a href="${qs({ pagina: page + 1 })}">Volgende &rarr;</a>` : html`<span></span>`}</nav>` : ''}
</section>`);
}

export function productEdit(req, { p, images, cats, selected }) {
  const specs = JSON.parse(p.specs || '[]');
  return adminLayout(req, 'producten', p.name, html`
<a class="back" href="/beheer/producten">&larr; Producten</a>
<form method="post" action="/beheer/producten/${p.id}" class="adm__cols adm__cols--wide">
  <section class="panel adm-form">
    <label>Naam<input name="naam" value="${p.name}" required></label>
    <div class="adm-form__row">
      <label>Prijs (€, incl. btw)<input name="prijs" inputmode="decimal" value="${(p.price / 100).toFixed(2).replace('.', ',')}" required></label>
      <label>Eenheid<select name="eenheid">${['m²', 'st', 'pak'].map(u => html`<option${u === p.unit ? raw(' selected') : ''}>${u}</option>`)}</select></label>
      <label>Merk<input name="merk" value="${p.brand}"></label>
      <label>SKU<input name="sku" value="${p.sku}"></label>
    </div>
    <label>Omschrijving<textarea name="omschrijving" rows="4">${p.description}</textarea></label>
    <label>Specificaties <small>(één per regel: Label: waarde)</small><textarea name="specs" rows="7">${specs.map(([k, v]) => `${k}: ${v}`).join('\n')}</textarea></label>
    <div class="imgs">${images.map(im => html`<img src="${imgSrc(im)}" alt="">`)}</div>
  </section>
  <div>
    <section class="panel adm-form">
      <h2>Publicatie</h2>
      <label class="chk"><input type="checkbox" name="zichtbaar" value="1" ${p.visible ? raw('checked') : ''}> Online zichtbaar</label>
      <label class="chk"><input type="checkbox" name="uitgelicht" value="1" ${p.featured ? raw('checked') : ''}> Uitlichten op homepage</label>
      <label>Voorraad<select name="voorraad"><option value="instock"${p.stock_status === 'instock' ? raw(' selected') : ''}>Op voorraad</option><option value="outofstock"${p.stock_status !== 'instock' ? raw(' selected') : ''}>Op bestelling</option></select></label>
      <button class="abtn">Opslaan</button>
      <a href="/product/${p.slug}" target="_blank">Bekijk op website ↗</a>
    </section>
    <section class="panel adm-form">
      <h2>Categorieën</h2>
      ${cats.map(c => html`<label class="chk${c.parent_id ? ' chk--sub' : ''}"><input type="checkbox" name="cat" value="${c.id}" ${selected.includes(c.id) ? raw('checked') : ''}> ${c.name}</label>`)}
    </section>
  </div>
</form>`);
}

export function customersPage(req, { customers, q }) {
  return adminLayout(req, 'klanten', 'Klanten', html`
<div class="filters"><form method="get"><input type="search" name="q" value="${q || ''}" placeholder="Zoek op naam of e-mail"></form><span class="muted">${customers.length} klanten</span></div>
<section class="panel"><table class="tbl"><thead><tr><th>Naam</th><th>Plaats</th><th>Klant sinds</th><th class="num">Bestellingen</th><th class="num">Besteed</th></tr></thead><tbody>
${customers.map(c => html`<tr data-href="/beheer/klanten/${c.id}"><td><a href="/beheer/klanten/${c.id}">${c.first_name} ${c.last_name}</a><small>${c.email}</small></td><td>${c.city || ''}</td><td>${dateNl(c.created_at)}</td><td class="num">${c.orders}</td><td class="num">${money(c.spent)}</td></tr>`)}
</tbody></table></section>`);
}

export function customerPage(req, { c, orders, appointments }) {
  return adminLayout(req, 'klanten', `${c.first_name} ${c.last_name}`.trim() || c.email, html`
<a class="back" href="/beheer/klanten">&larr; Klanten</a>
<div class="adm__cols adm__cols--wide">
  <section class="panel"><div class="panel__head"><h2>Bestellingen</h2></div>${orders.length ? ordersTable(orders) : html`<p class="muted">Nog geen bestellingen.</p>`}
    <h2 style="margin-top:28px">Afspraken</h2>${appointments.length ? html`<ul class="list">${appointments.map(a => html`<li><div><strong>${a.topic}</strong><span>${dateNl(a.created_at)}</span></div><span class="pill">${a.status}</span></li>`)}</ul>` : html`<p class="muted">Geen afspraken.</p>`}
  </section>
  <section class="panel"><h2>Gegevens</h2>
    <p><a href="mailto:${c.email}">${c.email}</a><br>${c.phone || ''}</p>
    <p class="muted">${c.company ? html`${c.company}<br>` : ''}${c.street || ''}<br>${c.postcode || ''} ${c.city || ''}</p>
    <p class="muted">Klant sinds ${dateNl(c.created_at)}<br>Laatst ingelogd ${c.last_login_at ? dateTimeNl(c.last_login_at) : 'nooit'}</p>
  </section>
</div>`);
}

const APPT = ['nieuw', 'ingepland', 'geweest', 'geannuleerd'];
export function appointmentsPage(req, { list }) {
  return adminLayout(req, 'afspraken', 'Afspraken & vragen', html`
<section class="panel"><table class="tbl"><thead><tr><th>Aangevraagd</th><th>Naam</th><th>Onderwerp</th><th>Bericht</th><th>Status</th></tr></thead><tbody>
${list.map(a => html`<tr><td>${dateTimeNl(a.created_at)}</td><td>${a.name}<small><a href="mailto:${a.email}">${a.email}</a>${a.phone ? html` · <a href="tel:${a.phone}">${a.phone}</a>` : ''}</small></td><td><span class="pill">${a.kind === 'vraag' ? 'Vraag' : 'Afspraak'}</span> ${a.topic}<small>${a.preferred || ''}</small></td><td class="wrapcell">${a.message || ''}</td>
<td><form method="post" action="/beheer/afspraken/${a.id}"><select name="status" onchange="this.form.submit()" class="pill-select pill--${a.status}">${APPT.map(s => html`<option${s === a.status ? raw(' selected') : ''}>${s}</option>`)}</select></form></td></tr>`)}
</tbody></table>${list.length ? '' : html`<p class="muted">Nog geen aanvragen.</p>`}</section>`);
}

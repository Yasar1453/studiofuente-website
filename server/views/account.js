import { html, raw, money, dateNl, ORDER_STATUS } from '../lib.js';
import { layout, em } from './layout.js';
import { orderView } from './shop.js';

const authShell = (req, { title, heading, intro, form, aside }) => layout(req, {
  title,
  body: html`
<section class="auth">
  <div class="auth__img"><img src="/assets/web/lib/showroom-hoek.webp" alt="" loading="lazy"></div>
  <div class="auth__body">
    <p class="eyebrow">Mijn Studio Fuente</p>
    <h1>${em(heading)}</h1>
    ${intro ? html`<p class="lead">${intro}</p>` : ''}
    ${form}
    ${aside || ''}
  </div>
</section>`,
});

const err = e => e ? html`<div class="notice notice--error" role="alert">${e}</div>` : '';
const hiddenBack = back => back ? html`<input type="hidden" name="terug" value="${back}">` : '';

export const loginPage = (req, { error, email = '', back = '' } = {}) => authShell(req, {
  title: 'Inloggen',
  heading: 'Welkom *terug*',
  intro: 'Log in om je bestellingen te volgen en sneller af te rekenen.',
  form: html`${err(error)}
  <form class="form form--dark" method="post" action="/account/inloggen">
    ${hiddenBack(back)}
    <label class="full"><span>E-mail</span><input name="email" type="email" value="${email}" required autocomplete="email" autofocus></label>
    <label class="full"><span>Wachtwoord</span><input name="wachtwoord" type="password" required autocomplete="current-password"></label>
    <button class="btn" type="submit">Inloggen</button>
    <a class="form__link" href="/account/wachtwoord-vergeten">Wachtwoord vergeten?</a>
  </form>`,
  aside: html`<p class="auth__switch">Nog geen account? <a href="/account/registreren${back ? '?terug=' + encodeURIComponent(back) : ''}">Maak er een aan</a></p>`,
});

export const registerPage = (req, { error, values = {}, back = '' } = {}) => authShell(req, {
  title: 'Account aanmaken',
  heading: 'Maak een *account*',
  intro: 'Bewaar je gegevens, volg je bestellingen en zie je aanvragen op één plek.',
  form: html`${err(error)}
  <form class="form form--dark" method="post" action="/account/registreren">
    ${hiddenBack(back)}
    <label><span>Voornaam</span><input name="voornaam" value="${values.voornaam || ''}" required autocomplete="given-name"></label>
    <label><span>Achternaam</span><input name="achternaam" value="${values.achternaam || ''}" required autocomplete="family-name"></label>
    <label class="full"><span>E-mail</span><input name="email" type="email" value="${values.email || req.query.email || ''}" required autocomplete="email"></label>
    <label class="full"><span>Wachtwoord <small>(minimaal 8 tekens)</small></span><input name="wachtwoord" type="password" minlength="8" required autocomplete="new-password"></label>
    <label class="check full"><input type="checkbox" name="voorwaarden" value="1" required> Ik ga akkoord met de <a href="/algemene-voorwaarden" target="_blank">voorwaarden</a> en het <a href="/privacy" target="_blank">privacybeleid</a></label>
    <button class="btn" type="submit">Account aanmaken</button>
  </form>`,
  aside: html`<p class="auth__switch">Al een account? <a href="/account/inloggen">Log in</a></p>`,
});

export const forgotPage = (req, { error } = {}) => authShell(req, {
  title: 'Wachtwoord vergeten',
  heading: 'Wachtwoord *vergeten*',
  intro: 'Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord te kiezen.',
  form: html`${err(error)}
  <form class="form form--dark" method="post" action="/account/wachtwoord-vergeten">
    <label class="full"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
    <button class="btn" type="submit">Stuur link</button>
  </form>`,
  aside: html`<p class="auth__switch"><a href="/account/inloggen">Terug naar inloggen</a></p>`,
});

export const resetPage = (req, { token, error } = {}) => authShell(req, {
  title: 'Nieuw wachtwoord',
  heading: 'Kies een *nieuw wachtwoord*',
  form: html`${err(error)}
  <form class="form form--dark" method="post" action="/account/herstel/${token}">
    <label class="full"><span>Nieuw wachtwoord <small>(minimaal 8 tekens)</small></span><input name="wachtwoord" type="password" minlength="8" required autocomplete="new-password"></label>
    <button class="btn" type="submit">Opslaan</button>
  </form>`,
});

const accountShell = (req, active, body) => layout(req, {
  title: 'Mijn account',
  body: html`
<section class="shop-head"><div class="wrap">
  <p class="eyebrow">Mijn Studio Fuente</p>
  <h1>${em(`Hallo *${req.user.first_name || 'daar'}*`)}</h1>
</div></section>
<section class="wrap account">
  <nav class="account__nav" aria-label="Account">
    <a href="/account" class="${active === 'overzicht' ? 'is-on' : ''}">Bestellingen</a>
    <a href="/account/afspraken" class="${active === 'afspraken' ? 'is-on' : ''}">Afspraken</a>
    <a href="/account/gegevens" class="${active === 'gegevens' ? 'is-on' : ''}">Gegevens</a>
    <form method="post" action="/account/uitloggen"><button type="submit">Uitloggen</button></form>
  </nav>
  <div class="account__body">${body}</div>
</section>`,
});

export const statusPill = s => html`<span class="pill pill--${s}">${ORDER_STATUS[s] || s}</span>`;

export function accountOverview(req, orders) {
  return accountShell(req, 'overzicht', orders.length ? html`
  <table class="table">
    <thead><tr><th>Bestelling</th><th>Datum</th><th>Status</th><th class="num">Totaal</th><th></th></tr></thead>
    <tbody>${orders.map(o => html`<tr>
      <td data-label="Bestelling"><a href="/account/bestelling/${o.number}">${o.number}</a></td>
      <td data-label="Datum">${dateNl(o.created_at)}</td>
      <td data-label="Status">${statusPill(o.status)}</td>
      <td data-label="Totaal" class="num">${money(o.total)}</td>
      <td class="num"><a class="link-line" href="/account/bestelling/${o.number}">Bekijk</a></td></tr>`)}</tbody>
  </table>` : html`<div class="empty empty--left"><h2>${em('Nog geen *bestellingen*')}</h2><p>Zodra je iets bestelt, zie je het hier terug met de status.</p><a class="btn" href="/producten">Naar de collectie</a></div>`);
}

export function accountOrder(req, order, items, events) {
  return accountShell(req, 'overzicht', html`<a class="back" href="/account">&larr; Alle bestellingen</a>${orderView(order, items, events)}`);
}

export function accountAppointments(req, list) {
  return accountShell(req, 'afspraken', list.length ? html`
  <table class="table"><thead><tr><th>Aangevraagd</th><th>Onderwerp</th><th>Voorkeur</th><th>Status</th></tr></thead>
  <tbody>${list.map(a => html`<tr><td data-label="Aangevraagd">${dateNl(a.created_at)}</td><td data-label="Onderwerp">${a.topic}</td><td data-label="Voorkeur">${a.preferred}</td><td data-label="Status"><span class="pill">${a.status}</span></td></tr>`)}</tbody></table>
  <a class="btn" href="/afspraak">Nieuwe afspraak</a>` : html`<div class="empty empty--left"><h2>${em('Nog geen *afspraken*')}</h2><p>Plan een bezoek aan de showroom en we nemen de tijd voor je.</p><a class="btn" href="/afspraak">Afspraak maken</a></div>`);
}

export function accountDetails(req, { error } = {}) {
  const u = req.user;
  return accountShell(req, 'gegevens', html`
  ${err(error)}
  <form class="form form--light" method="post" action="/account/gegevens">
    <h3 class="form__title">Persoonlijke gegevens</h3>
    <label><span>Voornaam</span><input name="voornaam" value="${u.first_name}" autocomplete="given-name"></label>
    <label><span>Achternaam</span><input name="achternaam" value="${u.last_name}" autocomplete="family-name"></label>
    <label><span>Telefoon</span><input name="telefoon" value="${u.phone}" type="tel" autocomplete="tel"></label>
    <label><span>Bedrijf <small>(optioneel)</small></span><input name="bedrijf" value="${u.company}" autocomplete="organization"></label>
    <label class="full"><span>Straat en huisnummer</span><input name="straat" value="${u.street}" autocomplete="street-address"></label>
    <label><span>Postcode</span><input name="postcode" value="${u.postcode}" autocomplete="postal-code"></label>
    <label><span>Plaats</span><input name="plaats" value="${u.city}" autocomplete="address-level2"></label>
    <button class="btn" type="submit">Opslaan</button>
  </form>
  <form class="form form--light" method="post" action="/account/wachtwoord">
    <h3 class="form__title">Wachtwoord wijzigen</h3>
    <label><span>Huidig wachtwoord</span><input name="huidig" type="password" required autocomplete="current-password"></label>
    <label><span>Nieuw wachtwoord</span><input name="nieuw" type="password" minlength="8" required autocomplete="new-password"></label>
    <button class="btn" type="submit">Wijzigen</button>
  </form>
  <p class="account__email">Ingelogd als ${u.email}</p>`);
}

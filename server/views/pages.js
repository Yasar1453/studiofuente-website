import { html, raw } from '../lib.js';
import { layout, pageHead, em } from './layout.js';
import { productCard } from './shop.js';
import { ARTICLES, leestijd } from '../journaal.js';
import * as PL from '../planning.js';

export const REELS = [
  { id: '1758397685579874', title: 'Villa Amsterdam' },
  { id: '1367918648100999', title: 'Villa Landsmeer' },
  { id: '1595538632588203', title: 'Villa Heerhugowaard' },
  { id: '926659896508071', title: 'Marmeren wasbakken' },
  { id: '4589488871294099', title: 'Zie. Voel. Beleef.' },
  { id: '1079809971403798', title: 'Kast op maat' },
  { id: '1878561399429307', title: 'DecoLegno platen' },
  { id: '1038959738767519', title: 'Wandpanelen' },
  { id: '1077112771446680', title: 'Maatwerk in marmer' },
  { id: '1733007604599391', title: 'Akoestische wandpanelen' },
  { id: '1617907667020622', title: 'De showroom groeit' },
];

export const REVIEWS = [
  { name: 'Shiwi K.', text: 'Erg blij met de service. Heel betaalbaar vergeleken met andere winkels, top kwaliteit en snelle levertijden. Eerst de vloer beneden laten leggen. Vonden we zo mooi dat we meteen hebben gezegd om boven ook helemaal te doen.' },
  { name: 'S. Trn', text: 'De stalen binnendeur is niet alleen van uitstekende kwaliteit, maar ook een echte eyecatcher in ons interieur. Levering en montage waren keurig en op tijd.' },
  { name: 'Erdal Aydin', text: 'Ik heb hier de marmeren tegels en badkamerkranen gevonden die ik zocht. Ik heb er drie uur doorgebracht en ze hielpen me zonder enige verveling met alles.' },
  { name: 'Rim Aldabee', text: 'Voor mijn badkamer heb ik zowel tegels als sanitair gekocht. Deskundig advies, de showroom gaf veel inspiratie en de levering verliep helemaal volgens afspraak.' },
  { name: 'Burak', text: 'Netjes!' },
];

export { SERVICES } from '../content.js';
import { SERVICES } from '../content.js';

// Beeld: foto of stil doorlopend filmpje (speelt alleen in beeld, zie main.js)
export const media = (m, alt = '', extra = '') => typeof m === 'object' && m.video
  ? html`<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="none" data-ambient aria-label="${alt}" ${raw(extra)}></video>`
  : html`<img src="${m}" alt="${alt}" loading="lazy" ${raw(extra)}>`;

const STEPS = [
  ['Eerste ontmoeting', 'We leren je woonstijl, je wensen en je dagelijkse routines kennen.'],
  ['Ontwerpverkenning', 'In de showroom ontdek je welke materialen en afwerkingen de sfeer bepalen.'],
  ['Ontwerp op maat', 'We werken een concept uit waarin elk detail klopt met je ruimte.'],
  ['Oplevering', 'Na jouw akkoord nemen wij de uitvoering over. Zorgvuldig gepland, netjes afgewerkt.'],
];

const reelsBlock = (eyebrow = 'Recent werk', title = 'Van showroom\n*tot villa*') => html`
<section class="werk" id="werk">
  <div class="wrap section-head section-head--row">
    <div>
      <p class="eyebrow reveal">${eyebrow}</p>
      <h2 class="reveal">${em(title)}</h2>
    </div>
    <div class="werk__tools reveal">
      <button class="werk__sound" data-reel-sound aria-pressed="false">Geluid aan</button>
      <a class="link-line link-line--light" href="https://www.instagram.com/studiofuente/" target="_blank" rel="noopener">Volg @studiofuente</a>
    </div>
  </div>
  <div class="reel-track" data-reels>
    ${REELS.map((r, i) => html`
    <figure class="reel" data-reel="${i}">
      <video src="/assets/web/reels/${r.id}.mp4" poster="/assets/web/reels/${r.id}.jpg" muted playsinline preload="${i < 2 ? 'metadata' : 'none'}"></video>
      <div class="reel__bar"><span></span></div>
      <figcaption><span class="reel__no">${String(i + 1).padStart(2, '0')}</span>${r.title}</figcaption>
    </figure>`)}
  </div>
  <div class="wrap track-nav">
    <span class="track-nav__hint">Speelt vanzelf door</span>
    <button data-dir="-1" aria-label="Vorige video">&larr;</button>
    <button data-dir="1" aria-label="Volgende video">&rarr;</button>
  </div>
</section>`;

export const reviewsBlock = () => html`
<section class="reviews" aria-label="Wat klanten zeggen">
  <div class="wrap reviews__head">
    <p class="eyebrow reveal">Google recensies</p>
    <h2 class="reveal">${em('In hun *eigen woorden*')}</h2>
  </div>
  <div class="marquee" data-marquee>
    <div class="marquee__row">
      ${[...REVIEWS, ...REVIEWS].map((r, i) => html`
      <blockquote class="review"${i >= REVIEWS.length ? raw(' aria-hidden="true"') : ''}>
        <span class="review__mark" aria-hidden="true">&ldquo;</span>
        <p>${r.text}</p>
        <footer><cite>${r.name}</cite><span>Google</span></footer>
      </blockquote>`)}
    </div>
  </div>
</section>`;

// Banner: vier staande video's naast elkaar die laten zien wat Studio Fuente doet.
const HERO = [
  { src: '/assets/web/clips/villa-45', label: 'Complete woningen' },
  { src: '/assets/web/hero-kast', label: 'Kasten op maat' },
  { src: '/assets/web/clips/marmer-45', label: 'Maatwerk in marmer' },
  { src: '/assets/web/reels/1878561399429307', label: 'Materialen en decors' },
];

export function home(req, featured) {
  return layout(req, {
    hero: true,
    jsonld: { '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: 'Studio Fuente', url: 'https://studiofuente.nl', telephone: '+31203033499', email: 'info@studiofuente.nl',
      address: { '@type': 'PostalAddress', streetAddress: 'Sierenborch 4', postalCode: '1043 BA', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      sameAs: ['https://www.instagram.com/studiofuente/', 'https://www.facebook.com/profile.php?id=61577575230191'] },
    body: html`
<section class="hero">
  <div class="hero__media"><img src="/assets/web/hero.webp" alt="De showroom van Studio Fuente met marmeren tegelpanelen en bloesem" width="2048" height="1365"></div>
  <div class="hero__panels" data-hero-panels>
    ${HERO.map((h, i) => html`<figure class="hero__panel${i ? '' : ' is-on'}">
      <video src="${h.src}.mp4" poster="${h.src}.jpg" muted loop playsinline preload="none" data-ambient aria-label="${h.label}"></video>
      <figcaption><span>0${i + 1}</span>${h.label}</figcaption>
    </figure>`)}
  </div>
  <div class="hero__shade"></div>
  <div class="hero__content">
    <h1 class="hero__title">Het complete interieur.<br><em>Onder één dak.</em></h1>
  </div>
  <div class="hero__foot">
    <p>Tegels, sanitair, maatwerk en vloeren.<br>Gekozen met aandacht, geplaatst met zorg.</p>
    <div class="hero__links">
      <a class="link-line link-line--light" href="/producten">Bekijk de collectie</a>
      <a class="link-line link-line--light" href="/afspraak">Plan een bezoek</a>
    </div>
  </div>
</section>

<section class="duo">
  <a class="duo__item reveal" href="/producten">
    <div class="duo__img"><video src="/assets/web/clips/decolegno-54.mp4" poster="/assets/web/clips/decolegno-54.jpg" muted loop playsinline preload="none" data-ambient aria-label="Verlichte wand met materiaalstalen"></video></div>
    <div class="duo__text"><p class="eyebrow">Webwinkel</p><h2>Producten</h2><p>Tegels, PVC vloeren en wandpanelen. Direct online te bestellen.</p><span class="link-line">Naar de winkel</span></div>
  </a>
  <a class="duo__item reveal" href="/diensten">
    <div class="duo__img"><video src="/assets/web/clips/villa-54.mp4" poster="/assets/web/clips/villa-54.jpg" muted loop playsinline preload="none" data-ambient aria-label="Villa Amsterdam"></video></div>
    <div class="duo__text"><p class="eyebrow">Maatwerk</p><h2>Diensten</h2><p>Kasten, stalen deuren, badkamers en complete verbouwingen.</p><span class="link-line">Wat we doen</span></div>
  </a>
</section>

${reelsBlock()}

${reviewsBlock()}

<section class="visit">
  <img src="/assets/web/lib/showroom-overzicht.webp" alt="" loading="lazy">
  <div class="visit__shade"></div>
  <div class="wrap visit__body">
    <p class="eyebrow eyebrow--light reveal">Sierenborch 4, Amsterdam</p>
    <h2 class="reveal">${em('Zien, voelen\n*en vergelijken*')}</h2>
    <a class="btn btn--light reveal" href="/afspraak">Plan een showroomafspraak</a>
  </div>
</section>`,
  });
}

export function diensten(req) {
  return layout(req, {
    title: 'Diensten',
    description: 'Van tegels en sanitair tot kasten op maat en stalen deuren. Studio Fuente begeleidt je hele interieur.',
    body: html`
${pageHead('Diensten', em('Alles wat een woning\n*af maakt*'), 'Wij begeleiden je van de eerste keuze tot de oplevering. Eén aanspreekpunt, één showroom, één plan.')}
<section class="collectie">
  <div class="wrap">
    <ol class="index" id="index">
      ${SERVICES.map((s, i) => html`<li><a href="/diensten/${s.slug}" data-img="${s.img}" data-pos="${s.pos || '50% 50%'}">
        <span class="index__no">${String(i + 1).padStart(2, '0')}</span><span class="index__name">${s.name}</span><span class="index__desc">${s.desc}</span></a></li>`)}
    </ol>
  </div>
  <div class="index__preview" aria-hidden="true"><img alt=""></div>
</section>
<section class="band band--reverse">
  <div class="band__media"><video src="/assets/web/clips/villa-45.mp4" poster="/assets/web/clips/villa-45.jpg" muted loop playsinline preload="none" data-ambient aria-label="Villa Amsterdam, opgeleverd door Studio Fuente"></video></div>
  <div class="band__text">
    <p class="eyebrow eyebrow--light reveal">Project</p>
    <h2 class="reveal">${em('Villa Amsterdam\n*van kaal tot af*')}</h2>
    <p class="lead lead--light reveal">Tegels, kasten op maat, keuken en afwerking. Eén plan, één team, één aanspreekpunt.</p>
    <a class="link-line link-line--light reveal" href="/#werk">Meer projecten</a>
  </div>
</section>
<section class="werkwijze">
  <div class="werkwijze__img reveal-img"><img src="/assets/web/showroom-deur.webp" alt="Stalen deur en tegelpresentatie in de showroom" loading="lazy"></div>
  <div class="werkwijze__body">
    <p class="eyebrow reveal">Werkwijze</p>
    <h2 class="reveal">${em('Ontworpen\n*rond jou*')}</h2>
    <ol class="process">
      ${STEPS.map(([h, p], i) => html`<li class="reveal"><span>0${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`)}
    </ol>
    <a class="btn reveal" href="/afspraak">Start met een afspraak</a>
  </div>
</section>`,
  });
}

export function showroom(req) {
  return layout(req, {
    title: 'Showroom',
    description: 'Bezoek de showroom van Studio Fuente aan de Sierenborch in Amsterdam. Materialen op groot formaat, in daglicht.',
    body: html`
${pageHead('De showroom', em('Materialen kies je\n*niet op een scherm*'), 'In onze showroom aan de Sierenborch staan de collecties op groot formaat, in daglicht, naast elkaar. Je ziet direct wat bij elkaar past.')}
<figure class="wide reveal-img"><img src="/assets/web/lib/showroom-lounge.webp" alt="Loungehoek in de showroom van Studio Fuente" loading="lazy"></figure>
<section class="showroom">
  <div class="wrap showroom__grid">
    <div class="showroom__intro">
      <p class="eyebrow reveal">Wat je kunt verwachten</p>
      <h2 class="reveal">${em('Een bezoek\n*met aandacht*')}</h2>
      <p class="lead reveal">Met meer dan negentien jaar ervaring helpen we je kiezen. Neem foto’s en maten mee, dan maken we het meteen concreet.</p>
      <a class="btn reveal" href="/afspraak">Plan je bezoek</a>
    </div>
    <ol class="steps">
      <li class="reveal"><span>I</span><h3>Jouw wensen</h3><p>We beginnen met een gesprek over je woning, je stijl en je planning.</p></li>
      <li class="reveal"><span>II</span><h3>De collectie</h3><p>Je ziet en voelt de materialen die passen bij jouw project.</p></li>
      <li class="reveal"><span>III</span><h3>Groot formaat</h3><p>Favorieten bekijk je op ware grootte, zodat je weet wat je kiest.</p></li>
      <li class="reveal"><span>IV</span><h3>Eerlijk advies</h3><p>We helpen je kiezen in materiaal, decor en budget.</p></li>
    </ol>
  </div>
</section>
<section class="mosaic wrap" aria-label="Foto's van de showroom">
  <figure class="mosaic__a reveal"><img src="/assets/web/lib/sanitair-meubel.webp" alt="Badkamermeubel met ronde spiegels" loading="lazy"><figcaption>Sanitair</figcaption></figure>
  <figure class="mosaic__b reveal"><img src="/assets/web/lib/detail-stalen-1-s.webp" alt="Detail van tegelstalen" loading="lazy"></figure>
  <figure class="mosaic__c reveal"><img src="/assets/web/lib/sanitair-kranen.webp" alt="Messing kranen op marmer" loading="lazy"><figcaption>Kranen</figcaption></figure>
  <figure class="mosaic__d reveal"><img src="/assets/web/lib/tegels-marmerwand.webp" alt="Marmeren tegelwand op groot formaat" loading="lazy"><figcaption>Tegels op groot formaat</figcaption></figure>
  <figure class="mosaic__e reveal"><img src="/assets/web/lib/pvc-wand.webp" alt="PVC- en parketpresentatie" loading="lazy"><figcaption>Vloeren</figcaption></figure>
  <figure class="mosaic__f reveal"><img src="/assets/web/lib/detail-stalen-4-s.webp" alt="Stalen bij het raam" loading="lazy"></figure>
  <figure class="mosaic__g reveal"><img src="/assets/web/lib/showroom-hoek.webp" alt="Ingerichte hoek met tegels en stalen" loading="lazy"><figcaption>Inspiratie</figcaption></figure>
</section>
<section class="band">
  <div class="band__media"><video src="/assets/web/clips/decolegno-45.mp4" poster="/assets/web/clips/decolegno-45.jpg" muted loop playsinline preload="none" data-ambient aria-label="Materiaalbibliotheek met DecoLegno decors"></video></div>
  <div class="band__text">
    <p class="eyebrow eyebrow--light reveal">Materiaalbibliotheek</p>
    <h2 class="reveal">${em('Honderden decors\n*binnen handbereik*')}</h2>
    <p class="lead lead--light reveal">Voor kasten, wandpanelen en badkamermeubels kies je uit de complete DecoLegno-collectie. Van warm hout tot diep zwart, verlicht zoals het thuis ook staat.</p>
    <a class="link-line link-line--light reveal" href="/diensten/kasten-op-maat">Kasten op maat</a>
  </div>
</section>
<section class="materiaal">
  <div class="wrap">
    <ul class="brands" aria-label="Merken in de showroom">
      <li>Cerkoni</li><li>Sartoria</li><li>Terratinta</li><li>Muozo</li><li>Oppio</li><li>DecoLegno</li><li>Arte</li>
    </ul>
  </div>
</section>
${reviewsBlock()}`,
  });
}

const TOPICS = ['Tegels', 'Sanitair', 'Kasten op maat', 'Stalen deuren', 'PVC vloer', 'Wandpanelen', 'Tuintegels', 'Veranda’s', 'Behang', 'Sfeerhaarden', 'Complete verbouwing', 'Iets anders'];

export function afspraak(req, { values = {}, errors = {}, sent = false } = {}) {
  const v = { naam: req.user ? `${req.user.first_name} ${req.user.last_name}`.trim() : '', email: req.user?.email || '', telefoon: req.user?.phone || '', onderwerp: req.query.onderwerp || '', ...values };
  const dagen = PL.days();
  const tijden = PL.slots(v.met, v.duur, v.datum);
  const wie = PL.staffById(req.query.met), q = req.query;
  const bevestigd = sent && wie && PL.validDay(q.datum || '') && /^\d{2}:\d{2}$/.test(q.tijd || '');
  const sel = (a, b) => String(a) === String(b) ? raw(' checked') : '';
  const fout = Object.keys(errors).length;
  return layout(req, {
    title: 'Afspraak maken',
    description: 'Plan een showroomafspraak bij Studio Fuente in Amsterdam. Kies met wie, hoelang en wanneer.',
    bodyClass: 'page-afspraak',
    body: html`
<section class="afspraak">
  <div class="afspraak__img"><img src="/assets/web/lib/showroom-lounge.webp" alt="" loading="lazy"><div class="afspraak__contact">
    <p><span>Adres</span><a href="https://maps.google.com/?q=Sierenborch+4,+1043+BA+Amsterdam" target="_blank" rel="noopener">Sierenborch 4, 1043 BA Amsterdam</a></p>
    <p><span>Telefoon</span><a href="tel:+31203033499">020 303 3499</a></p>
    <p><span>E-mail</span><a href="mailto:info@studiofuente.nl">info@studiofuente.nl</a></p>
  </div></div>
  <div class="afspraak__body">
    ${sent ? html`
      <p class="eyebrow eyebrow--light">Showroomafspraak</p>
      <h1>${em('Dank je wel.\n*Tot snel.*')}</h1>
      ${bevestigd
        ? html`<p class="lead lead--light">Je aanvraag staat genoteerd voor ${PL.dateLong(q.datum)} om ${q.tijd} met ${wie.name}. We nemen contact met je op om de afspraak te bevestigen.</p>`
        : html`<p class="lead lead--light">We hebben je aanvraag ontvangen en nemen contact met je op om de afspraak te bevestigen.</p>`}
      <a class="link-line link-line--light" href="/projecten">Bekijk alvast onze projecten</a>`
    : html`
      <p class="eyebrow eyebrow--light">Showroomafspraak</p>
      <h1>${em('Kom langs.\n*We nemen de tijd.*')}</h1>
      <form class="plan" method="post" action="/afspraak" novalidate data-plan>
        <fieldset class="plan__step">
          <legend><span>01</span>Met wie wil je een afspraak</legend>
          <div class="plan__opts plan__opts--2">
            ${PL.STAFF.map(p => html`<label class="opt"><input type="radio" name="met" value="${p.id}"${sel(v.met, p.id)} required><span><strong>${p.name}</strong></span></label>`)}
          </div>
          ${errors.met ? html`<p class="plan__err">Kies met wie je een afspraak wilt.</p>` : ''}
        </fieldset>
        <fieldset class="plan__step">
          <legend><span>02</span>Hoelang heb je nodig</legend>
          <div class="plan__opts plan__opts--3">
            ${PL.DURATIONS.map(d => html`<label class="opt"><input type="radio" name="duur" value="${d.min}"${sel(v.duur, d.min)} required><span><strong>${d.label}</strong><small>${d.hint}</small></span></label>`)}
          </div>
          ${errors.duur ? html`<p class="plan__err">Kies hoelang de afspraak mag duren.</p>` : ''}
        </fieldset>
        <fieldset class="plan__step">
          <legend><span>03</span>Kies een dag en een tijdstip</legend>
          <div class="plan__days" data-plan-days>
            ${dagen.map(d => html`<label class="day"><input type="radio" name="datum" value="${d.date}"${sel(v.datum, d.date)} required><span><small>${d.weekday}</small><strong>${d.day}</strong><small>${d.month}</small></span></label>`)}
          </div>
          <div class="plan__times" data-plan-times data-gekozen="${v.tijd || ''}">
            ${tijden.length
              ? tijden.map(t => html`<label class="time"><input type="radio" name="tijd" value="${t.time}"${t.free ? sel(v.tijd, t.time) : raw(' disabled')} required><span>${t.time}</span></label>`)
              : html`<p class="plan__hint">Kies eerst met wie, hoelang en op welke dag. Daarna zie je de vrije tijden.</p>`}
          </div>
          ${errors.datum || errors.tijd ? html`<p class="plan__err">Kies een dag en een vrij tijdstip.</p>` : ''}
        </fieldset>
        <fieldset class="plan__step">
          <legend><span>04</span>Jouw gegevens</legend>
          <div class="form">
            <label><span>Naam</span><input name="naam" value="${v.naam}" required autocomplete="name" class="${errors.naam ? 'is-invalid' : ''}"></label>
            <label><span>Telefoon</span><input name="telefoon" type="tel" value="${v.telefoon}" autocomplete="tel"></label>
            <label class="full"><span>E-mail</span><input name="email" type="email" value="${v.email}" required autocomplete="email" class="${errors.email ? 'is-invalid' : ''}"></label>
            <label class="full"><span>Onderwerp</span>
              <select name="onderwerp">${TOPICS.map(t => html`<option${t === v.onderwerp ? raw(' selected') : ''}>${t}</option>`)}</select>
            </label>
            <label class="full"><span>Vertel kort over je project</span><textarea name="bericht" rows="3">${v.bericht || ''}</textarea></label>
            <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            ${errors.naam || errors.email ? html`<p class="form__note">Vul je naam en een geldig e-mailadres in.</p>` : ''}
            <p class="plan__summary full" data-plan-summary hidden></p>
            <button type="submit" class="btn btn--light">Afspraak aanvragen</button>
            ${fout ? html`<p class="form__note">Nog niet alles is ingevuld. Kijk de stappen hierboven na.</p>` : ''}
          </div>
        </fieldset>
      </form>`}
  </div>
</section>`,
  });
}

export function legal(req, page, fallbackTitle) {
  return layout(req, {
    title: page?.title || fallbackTitle,
    body: html`
${pageHead('Studio Fuente', page?.title || fallbackTitle)}
<section class="legal wrap">
  ${page ? html`<div class="legal__body">${raw(page.html)}</div>
  <p class="legal__meta">Laatst bijgewerkt: ${page.updated_at ? new Date(page.updated_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>`
  : html`<div class="legal__body"><p>Deze tekst wordt overgenomen van de huidige website zodra de import klaar is. Tot die tijd vind je hem op <a href="https://studiofuente.nl/${fallbackTitle === 'Privacy' ? 'privacy-policy' : 'algemene-voorwaarden'}/">studiofuente.nl</a>.</p></div>`}
</section>`,
  });
}

export function notFound(req) {
  return layout(req, {
    title: 'Niet gevonden',
    body: html`${pageHead('404', em('Deze pagina\n*bestaat niet (meer)*'), 'Misschien is het product verplaatst. Kijk in de collectie of neem contact met ons op.')}
    <section class="wrap" style="padding-bottom:120px"><a class="btn" href="/producten">Naar de producten</a></section>`,
  });
}

export function dienst(req, sv, products) {
  const i = SERVICES.indexOf(sv), next = SERVICES[(i + 1) % SERVICES.length];
  return layout(req, {
    title: sv.name,
    description: `${sv.name} bij Studio Fuente in Amsterdam. ${sv.desc}`,
    body: html`
<section class="svc-hero">
  <div class="wrap svc-hero__grid">
    <div class="svc-hero__text">
      <nav class="crumbs"><a href="/">Home</a><span>/</span><a href="/diensten">Diensten</a><span>/</span><span>${sv.name}</span></nav>
      <p class="eyebrow">Dienst ${String(i + 1).padStart(2, '0')}</p>
      <h1>${em(sv.name.includes(' ') ? sv.name.replace(/^(\S+)\s(.*)$/, '$1 *$2*') : sv.name)}</h1>
      <p class="lead">${sv.intro}</p>
      <ul class="svc-points">${sv.points.map(p => html`<li>${p}</li>`)}</ul>
      <div class="svc-actions">
        <a class="btn" href="/afspraak?onderwerp=${encodeURIComponent(sv.name)}">Plan een afspraak</a>
        ${sv.shop ? html`<a class="link-line" href="${sv.shop}">Bekijk in de webwinkel</a>` : html`<a class="link-line" href="/contact">Stel een vraag</a>`}
      </div>
    </div>
    <figure class="svc-hero__img reveal-img">${sv.video ? media({ video: sv.video, poster: sv.img }, sv.name) : html`<img src="${sv.img}" alt="${sv.name}" style="object-position:${sv.pos || '50% 50%'}">`}</figure>
  </div>
</section>
${sv.gallery?.length ? html`<section class="svc-gallery">
  <div class="wrap section-head section-head--row"><div><p class="eyebrow reveal">In beeld</p><h2 class="reveal">${em(sv.galleryTitle || sv.name + ' *in de praktijk*')}</h2></div>
  ${sv.gallery.length > 3 ? html`<div class="track-nav track-nav--light"><button data-scroll="-1" aria-label="Vorige">&larr;</button><button data-scroll="1" aria-label="Volgende">&rarr;</button></div>` : ''}</div>
  <div class="${sv.gallery.length > 3 ? 'strip' : 'trio wrap'}" data-strip>${sv.gallery.map((g, k) => html`<figure class="reveal">${media(g, `${sv.name}, foto ${k + 1}`)}</figure>`)}</div>
</section>` : ''}
${products.length ? html`<section class="featured featured--tight"><div class="wrap">
  <div class="section-head section-head--row"><div><p class="eyebrow">Uit de webwinkel</p><h2>${em('Direct *te bestellen*')}</h2></div><a class="link-line" href="${sv.shop}">Alles bekijken</a></div>
  <div class="grid grid--4">${products.map(productCard)}</div></div></section>` : ''}
<section class="werkwijze werkwijze--compact">
  <div class="werkwijze__body">
    <p class="eyebrow reveal">Zo werken we</p>
    <ol class="process">${STEPS.map(([h, p], k) => html`<li class="reveal"><span>0${k + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`)}</ol>
  </div>
  <a class="svc-next" href="/diensten/${next.slug}"><img src="${next.img}" alt="" loading="lazy" style="object-position:${next.pos || '50% 50%'}"><span>Volgende dienst</span><strong>${next.name} &rarr;</strong></a>
</section>`,
  });
}

export function contact(req, { values = {}, errors = {}, sent = false } = {}) {
  const v = { naam: req.user ? `${req.user.first_name} ${req.user.last_name}`.trim() : '', email: req.user?.email || '', onderwerp: req.query.onderwerp || '', bericht: req.query.product ? `Ik wil graag de prijs weten van: ${String(req.query.product).slice(0, 120)}` : '', ...values };
  return layout(req, {
    title: 'Contact',
    description: 'Neem contact op met Studio Fuente. Sierenborch 4, 1043 BA Amsterdam. 020 303 3499, info@studiofuente.nl.',
    body: html`
${pageHead('Contact', em('Waar jouw visie\n*begint*'), 'Een vraag over een product, een bestelling of een project? We denken graag met je mee.')}
<section class="contact wrap">
  <div class="contact__info">
    <div><p class="contact__label">Showroom</p><a href="https://maps.google.com/?q=Sierenborch+4,+1043+BA+Amsterdam" target="_blank" rel="noopener">Sierenborch 4<br>1043 BA Amsterdam</a></div>
    <div><p class="contact__label">Bellen</p><a href="tel:+31203033499">020 303 3499</a></div>
    <div><p class="contact__label">Mailen</p><a href="mailto:info@studiofuente.nl">info@studiofuente.nl</a></div>
    <div><p class="contact__label">Volgen</p><a href="https://www.instagram.com/studiofuente/" target="_blank" rel="noopener">Instagram</a><br><a href="https://www.facebook.com/profile.php?id=61577575230191" target="_blank" rel="noopener">Facebook</a></div>
    <a class="contact__cta" href="/afspraak"><span>Liever langskomen?</span><strong>Plan een showroomafspraak &rarr;</strong></a>
  </div>
  <div class="contact__form">
    ${sent ? html`<h2>${em('Bedankt voor\n*je bericht*')}</h2><p class="lead">We reageren binnen één werkdag.</p>` : html`
    <form class="form" method="post" action="/contact" novalidate>
      <label><span>Naam</span><input name="naam" value="${v.naam}" required autocomplete="name" class="${errors.naam ? 'is-invalid' : ''}"></label>
      <label><span>E-mail</span><input name="email" type="email" value="${v.email}" required autocomplete="email" class="${errors.email ? 'is-invalid' : ''}"></label>
      <label><span>Telefoon <small>(optioneel)</small></span><input name="telefoon" type="tel" value="${v.telefoon || ''}" autocomplete="tel"></label>
      <label><span>Onderwerp</span><select name="onderwerp">${['Vraag over een product', 'Mijn bestelling', 'Offerte', 'Iets anders'].map(t => html`<option${t === v.onderwerp ? raw(' selected') : ''}>${t}</option>`)}</select></label>
      <label class="full"><span>Bericht</span><textarea name="bericht" rows="5" required class="${errors.bericht ? 'is-invalid' : ''}">${v.bericht || ''}</textarea></label>
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn" type="submit">Versturen</button>
      ${Object.keys(errors).length ? html`<p class="form__note">Vul je naam, een geldig e-mailadres en je bericht in.</p>` : ''}
    </form>`}
  </div>
</section>
<section class="map">
  <iframe title="Kaart: Studio Fuente, Sierenborch 4 Amsterdam" src="https://maps.google.com/maps?q=Sierenborch%204%2C%201043%20BA%20Amsterdam&z=15&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</section>`,
  });
}

// ---------- Journaal (kennisartikelen) ----------
export { ARTICLES };
const kale = t => t.replace(/\*/g, '');
const journaalCard = a => html`<a class="jcard reveal" href="/journaal/${a.slug}">
  <figure class="jcard__img"><img src="${a.img}" alt="" loading="lazy"></figure>
  <p class="jcard__meta"><span>${a.topic}</span><span>${leestijd(a)} min lezen</span></p>
  <h3>${em(a.title)}</h3>
  <p class="jcard__intro">${a.intro}</p>
</a>`;

export function journaal(req) {
  const [first, ...rest] = ARTICLES;
  return layout(req, {
    title: 'Journaal',
    description: 'Kennis uit de showroom van Studio Fuente. Over tegels, vloeren en de keuzes die een interieur afmaken.',
    body: html`
${pageHead('Journaal', em('Kennis uit\n*de showroom*'), 'Wat we dagelijks in de showroom uitleggen, hier rustig na te lezen. Over materialen, maten en de keuzes die een interieur afmaken.')}
<section class="journaal">
  <div class="wrap">
    <a class="jlead" href="/journaal/${first.slug}">
      <figure class="jlead__img reveal-img"><img src="${first.img}" alt=""></figure>
      <div class="jlead__text">
        <p class="jcard__meta"><span>${first.topic}</span><span>${leestijd(first)} min lezen</span></p>
        <h2>${em(first.title)}</h2>
        <p class="lead">${first.intro}</p>
        <span class="link-line">Lees het artikel</span>
      </div>
    </a>
    <div class="jgrid">${rest.map(journaalCard)}</div>
  </div>
</section>
<section class="jcta">
  <div class="wrap jcta__inner">
    <div><p class="eyebrow">Liever persoonlijk advies</p><h2>${em('Kom het\n*zelf bekijken*')}</h2></div>
    <div><p class="lead">In de showroom leggen we materialen naast elkaar en denken we mee over jouw ruimte.</p><a class="btn" href="/afspraak">Plan een afspraak</a></div>
  </div>
</section>`,
  });
}

export function artikel(req, a) {
  const sv = SERVICES.find(x => x.slug === a.service);
  const meer = ARTICLES.filter(x => x !== a).sort((x, y) => (y.topic === a.topic) - (x.topic === a.topic)).slice(0, 3);
  return layout(req, {
    title: kale(a.title),
    description: a.intro,
    image: a.img,
    jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: kale(a.title), description: a.intro, author: { '@type': 'Organization', name: 'Studio Fuente' }, publisher: { '@type': 'Organization', name: 'Studio Fuente' } },
    body: html`
<article class="art">
  <header class="art__head wrap">
    <div class="art__intro">
      <nav class="crumbs"><a href="/">Home</a><span>/</span><a href="/journaal">Journaal</a><span>/</span><span>${a.topic}</span></nav>
      <h1>${em(a.title.replace(': ', ':\n'))}</h1>
      <p class="lead">${a.intro}</p>
      <p class="jcard__meta"><span>${a.topic}</span><span>${leestijd(a)} min lezen</span></p>
    </div>
    <figure class="art__img reveal-img"><img src="${a.img}" alt=""></figure>
  </header>
  <section class="art__kort">
    <div class="wrap">
      <p class="eyebrow">In het kort</p>
      <ol>${a.summary.map((x, k) => html`<li><span>0${k + 1}</span><p>${x}</p></li>`)}</ol>
    </div>
  </section>
  <div class="wrap art__body">
    ${a.sections.map(s => html`<section class="art__row"><h2>${s.h}</h2><div>${(s.p || []).map(x => html`<p>${x}</p>`)}${s.list ? html`<ul>${s.list.map(x => html`<li>${x}</li>`)}</ul>` : ''}</div></section>`)}
    <section class="art__row art__row--end">
      <h2>${em('Zelf *zien en voelen*')}</h2>
      <div>
        <p>Twijfel je over wat bij jouw ruimte past? In de showroom leggen we de materialen naast elkaar en kijken we er samen naar.</p>
        <div class="svc-actions"><a class="btn" href="/afspraak?onderwerp=${encodeURIComponent(sv ? sv.name : 'Iets anders')}">Plan een afspraak</a>${sv ? html`<a class="link-line" href="/diensten/${sv.slug}">Meer over ${sv.name.toLowerCase()}</a>` : ''}</div>
      </div>
    </section>
  </div>
</article>
<section class="journaal journaal--meer">
  <div class="wrap">
    <div class="section-head section-head--row"><div><p class="eyebrow">Verder lezen</p><h2>${em('Meer uit het *journaal*')}</h2></div><a class="link-line" href="/journaal">Alle artikelen</a></div>
    <div class="jgrid">${meer.map(journaalCard)}</div>
  </div>
</section>`,
  });
}

// ---------- Projecten en Over Fuente ----------
const PROJECTS = [
  { id: '1758397685579874', title: 'Villa Amsterdam', soort: 'Woning' },
  { id: '1367918648100999', title: 'Villa Landsmeer', soort: 'Woning' },
  { id: '1595538632588203', title: 'Villa Heerhugowaard', soort: 'Woning' },
  { id: '926659896508071', title: 'Marmeren wasbakken', soort: 'Maatwerk' },
  { id: '1079809971403798', title: 'Kast op maat', soort: 'Maatwerk' },
  { id: '1038959738767519', title: 'Wandpanelen', soort: 'Afwerking' },
];

export function projecten(req) {
  return layout(req, {
    title: 'Projecten',
    description: 'Projecten van Studio Fuente: villa’s, kasten op maat en maatwerk in marmer. Bekijk recent werk in beeld.',
    body: html`
${pageHead('Projecten', em('Van showroom\n*tot oplevering*'), 'Een greep uit recent werk. Van complete woningen tot één stuk maatwerk dat een ruimte afmaakt.')}
<section class="projecten">
  <div class="wrap projecten__grid">
    ${PROJECTS.map((r, i) => html`<figure class="project reveal">
      <div class="project__media"><video src="/assets/web/reels/${r.id}.mp4" poster="/assets/web/reels/${r.id}.jpg" muted loop playsinline preload="none" data-ambient aria-label="${r.title}"></video></div>
      <figcaption><span>${String(i + 1).padStart(2, '0')} &nbsp;·&nbsp; ${r.soort}</span><strong>${r.title}</strong></figcaption>
    </figure>`)}
  </div>
</section>
<section class="jcta">
  <div class="wrap jcta__inner">
    <div><p class="eyebrow">Jouw project</p><h2>${em('Begin met\n*een gesprek*')}</h2></div>
    <div><p class="lead">Vertel ons over je woning en je plannen. In de showroom laten we zien wat er mogelijk is.</p><a class="btn" href="/afspraak">Plan een afspraak</a></div>
  </div>
</section>`,
  });
}

export function overFuente(req) {
  return layout(req, {
    title: 'Over Fuente',
    description: 'Studio Fuente brengt het complete interieur samen op één adres in Amsterdam: tegels, sanitair, vloeren en maatwerk.',
    body: html`
${pageHead('Over Fuente', em('Eén adres voor\n*het hele interieur*'), 'Gekozen met aandacht, geplaatst met zorg.')}
<figure class="wide reveal-img"><img src="/assets/web/lib/showroom-overzicht.webp" alt="Overzicht van de showroom van Studio Fuente"></figure>
<section class="over">
  <div class="wrap over__grid">
    <h2 class="reveal">${em('Een interieur moet\n*rust uitstralen*')}</h2>
    <div class="over__text reveal">
      <p>Daarom brengen wij alles samen op één adres: van de eerste tegel tot de laatste deurgreep. Zodat materialen, kleuren en afwerking op elkaar aansluiten.</p>
      <p>Wij kiezen materialen op uitstraling én op hoe ze over tien jaar nog zijn. In onze showroom aan de Sierenborch staan de collecties op groot formaat, in daglicht, naast elkaar. Je ziet direct wat bij elkaar past.</p>
      <a class="link-line" href="/showroom">Bekijk de showroom</a>
    </div>
  </div>
</section>
<section class="band">
  <div class="band__media"><video src="/assets/web/clips/villa-45.mp4" poster="/assets/web/clips/villa-45.jpg" muted loop playsinline preload="none" data-ambient aria-label="Villa Amsterdam, opgeleverd door Studio Fuente"></video></div>
  <div class="band__text">
    <p class="eyebrow eyebrow--light reveal">Van keuze tot oplevering</p>
    <h2 class="reveal">${em('Eén plan,\n*één aanspreekpunt*')}</h2>
    <p class="lead lead--light reveal">Tegels, sanitair, kasten op maat, stalen deuren en vloeren. Wij begeleiden je van de eerste keuze tot de oplevering.</p>
    <a class="link-line link-line--light reveal" href="/projecten">Bekijk projecten</a>
  </div>
</section>
<section class="werkwijze">
  <div class="werkwijze__img reveal-img"><img src="/assets/web/showroom-deur.webp" alt="Stalen deur en tegelpresentatie in de showroom" loading="lazy"></div>
  <div class="werkwijze__body">
    <p class="eyebrow reveal">Werkwijze</p>
    <h2 class="reveal">${em('Ontworpen\n*rond jou*')}</h2>
    <ol class="process">
      ${STEPS.map(([h, p], i) => html`<li class="reveal"><span>0${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`)}
    </ol>
    <a class="btn reveal" href="/afspraak">Start met een afspraak</a>
  </div>
</section>
${reviewsBlock()}`,
  });
}

import { html } from '../lib.js';
import { FASES, BIJGEWERKT } from '../voortgang.js';

const LABEL = { klaar: 'Afgerond', bezig: 'Nu bezig', akkoord: 'Wacht op akkoord', volgt: '' };

// Eén scherm, zonder menu of voettekst: waar staan we en wat komt daarna.
export function voortgang() {
  const alle = FASES.flatMap(f => f.stappen);
  const klaar = alle.filter(s => s.status === 'klaar').length;
  const nu = alle.find(s => s.status === 'bezig' || s.status === 'akkoord');
  const faseNu = FASES.findIndex(f => f.stappen.includes(nu));
  const kop = !nu ? html`Het project is <em>afgerond</em>`
    : nu.status === 'akkoord' ? html`Wacht op akkoord: <em>${nu.naam.toLowerCase()}</em>`
    : html`Nu bezig: <em>${nu.naam.toLowerCase()}</em>`;
  return html`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="120">
<title>Voortgang | Studio Fuente</title>
<meta name="theme-color" content="#181613">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23181613%22/%3E%3Ctext x=%2216%22 y=%2222%22 text-anchor=%22middle%22 font-family=%22Georgia%22 font-size=%2218%22 fill=%22%23c9ac8b%22%3EF%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: #181613; color: #f7f4ef; font: 300 16px/1.5 "Jost", "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
.vg { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; padding: clamp(18px, 3.4vh, 40px) clamp(20px, 5vw, 84px); gap: clamp(14px, 3vh, 36px); max-width: 1500px; margin: 0 auto; }
.vg__top, .vg__foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #a39b8f; }
.vg__top img { height: clamp(20px, 3.4vh, 30px); width: auto; filter: invert(1); display: block; }
.vg__main { display: grid; align-content: center; gap: clamp(18px, 4.4vh, 56px); }
.vg__eyebrow { margin: 0 0 clamp(6px, 1.2vh, 14px); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #c9ac8b; }
h1 { margin: 0; font: 300 clamp(34px, min(6.2vw, 9.5vh), 92px)/1.02 "Cormorant", "Times New Roman", serif; letter-spacing: -.01em; }
h1 em { font-style: italic; color: #c9ac8b; }
.vg__lead { margin: clamp(8px, 1.6vh, 18px) 0 0; max-width: 52ch; color: #cfc8bc; font-size: clamp(14px, 1.9vh, 17px); }
.vg__fases { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20px, 4vw, 64px); }
.fase { border-top: 1px solid rgba(247, 244, 239, .22); padding-top: clamp(10px, 1.8vh, 20px); }
.fase.is-nu { border-top-color: #c9ac8b; }
.fase__kop { display: flex; align-items: baseline; gap: 14px; margin: 0 0 clamp(6px, 1.4vh, 16px); }
.fase__nr { font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #a39b8f; white-space: nowrap; }
.fase.is-nu .fase__nr { color: #c9ac8b; }
.fase h2 { margin: 0; font: 400 clamp(22px, 3.4vh, 34px)/1.1 "Cormorant", "Times New Roman", serif; }
.fase ol { list-style: none; margin: 0; padding: 0; }
.stap { display: grid; grid-template-columns: 18px 1fr auto; align-items: center; column-gap: 12px; padding: clamp(5px, 1.05vh, 11px) 0; border-bottom: 1px solid rgba(247, 244, 239, .09); color: #8f887c; font-size: clamp(14px, 1.95vh, 17px); }
.stap small { display: block; font-size: 12.5px; color: #7d766b; line-height: 1.3; }
.stap i { width: 9px; height: 9px; border-radius: 50%; border: 1px solid #6f675c; justify-self: center; }
.stap b { font: 400 11px/1 "Jost", sans-serif; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; }
.stap--klaar { color: #cfc8bc; } .stap--klaar i { background: #8f887c; border-color: #8f887c; } .stap--klaar b { color: #8f887c; }
.stap--bezig, .stap--akkoord { color: #f7f4ef; } .stap--bezig small, .stap--akkoord small { color: #a39b8f; }
.stap--bezig i, .stap--akkoord i { background: #c9ac8b; border-color: #c9ac8b; box-shadow: 0 0 0 0 rgba(201, 172, 139, .55); animation: puls 2.2s ease-out infinite; }
.stap--bezig b, .stap--akkoord b { color: #c9ac8b; }
.mijlpaal { margin: clamp(8px, 1.6vh, 16px) 0 0; padding: clamp(7px, 1.2vh, 11px) 14px; border-left: 2px solid #c9ac8b; background: rgba(201, 172, 139, .09); color: #e3d9c9; font-size: clamp(13px, 1.75vh, 15px); }
.vg__balk { flex: 1; height: 1px; background: rgba(247, 244, 239, .16); position: relative; max-width: 360px; }
.vg__balk span { position: absolute; inset: 0 auto 0 0; background: #c9ac8b; height: 1px; }
@keyframes puls { 70% { box-shadow: 0 0 0 9px rgba(201, 172, 139, 0); } 100% { box-shadow: 0 0 0 0 rgba(201, 172, 139, 0); } }
@media (prefers-reduced-motion: reduce) { .stap i { animation: none !important; } }
@media (max-width: 820px) {
  .vg__fases { grid-template-columns: 1fr; gap: clamp(12px, 2.4vh, 24px); }
  .vg__lead { display: none; }
  .stap small { display: none; }
  .vg__top, .vg__foot, .vg__eyebrow, .fase__nr { font-size: 10.5px; letter-spacing: .14em; }
  .vg__foot em, .vg__top em, .vg__balk, .vg__foot span:last-child { display: none; }
  .vg { padding-top: clamp(12px, 2.4vh, 28px); padding-bottom: clamp(12px, 2.4vh, 28px); gap: clamp(8px, 2vh, 24px); }
  .vg__main { gap: clamp(10px, 2.6vh, 30px); }
  h1 { font-size: clamp(27px, min(9vw, 6.4vh), 52px); }
  .stap { padding: clamp(3px, .85vh, 10px) 0; font-size: clamp(13.5px, 2.1vh, 16px); }
  .fase { padding-top: clamp(6px, 1.3vh, 14px); }
  .fase__kop { margin-bottom: clamp(2px, .8vh, 10px); }
  .fase h2 { font-size: clamp(20px, 3.2vh, 28px); }
  .mijlpaal { margin-top: clamp(5px, 1.1vh, 12px); padding: clamp(4px, .9vh, 9px) 12px; font-size: clamp(12.5px, 1.8vh, 14.5px); }
}
</style>
</head>
<body>
<div class="vg">
  <header class="vg__top">
    <img src="/assets/img/site/Studio-Fuente-Logo-01.webp" alt="Studio Fuente">
    <span style="white-space:nowrap"><em style="font-style:normal">Bijgewerkt </em>${BIJGEWERKT}</span>
  </header>
  <main class="vg__main">
    <div>
      <p class="vg__eyebrow">Voortgang${nu ? html` · fase ${faseNu + 1} van ${FASES.length}` : ''}</p>
      <h1>${kop}</h1>
      <p class="vg__lead">Elke stap ronden we af met jullie akkoord. Pas daarna gaan we door naar de volgende.</p>
    </div>
    <div class="vg__fases">
      ${FASES.map((f, i) => html`<section class="fase${i === faseNu ? ' is-nu' : ''}">
        <div class="fase__kop"><span class="fase__nr">Fase ${i + 1}</span><h2>${f.naam}</h2></div>
        <ol>
          ${f.stappen.map(s => html`<li class="stap stap--${s.status}"><i></i><span>${s.naam}${s.sub ? html`<small>${s.sub}</small>` : ''}</span><b>${LABEL[s.status] || ''}</b></li>`)}
        </ol>
        ${f.mijlpaal ? html`<p class="mijlpaal">${f.mijlpaal}</p>` : ''}
      </section>`)}
    </div>
  </main>
  <footer class="vg__foot">
    <span>${klaar} van ${alle.length} stappen afgerond</span>
    <div class="vg__balk"><span style="width:${Math.round(klaar / alle.length * 100)}%"></span></div>
    <span><em style="font-style:normal">Doorgaan </em>alleen na akkoord</span>
  </footer>
</div>
</body>
</html>`;
}

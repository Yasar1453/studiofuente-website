import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCb);
import { one, run } from './db.js';

// ---------- HTML ----------
export const esc = (v = '') => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Veilige HTML: html`...` escapet elke waarde, behalve resultaten van html`` en raw().
class Safe { constructor(s) { this.s = s; } toString() { return this.s; } }
const part = v => v == null || v === false ? '' : v instanceof Safe ? v.s : Array.isArray(v) ? v.map(part).join('') : esc(v);
export const html = (strings, ...vals) => new Safe(strings.reduce((out, s, i) => out + part(vals[i - 1]) + s));
export const raw = s => new Safe(String(s ?? ''));

// ---------- Geld ----------
const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
export const money = cents => fmt.format((cents || 0) / 100);
export const unitLabel = u => ({ 'm²': 'per m²', st: 'per stuk', pak: 'per pak' }[u] || (u ? 'per ' + u : ''));
export const dateNl = s => s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
export const dateTimeNl = s => s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

export const ORDER_STATUS = Object.assign(Object.create(null), {
  wacht_op_betaling: 'Wacht op betaling',
  betaald: 'Betaald',
  in_behandeling: 'In behandeling',
  verzonden: 'Verzonden',
  klaar_voor_ophalen: 'Klaar voor ophalen',
  afgerond: 'Afgerond',
  geannuleerd: 'Geannuleerd',
});

// ---------- Wachtwoorden ----------
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const h = await scrypt(String(pw), salt, 64, SCRYPT);
  return `scrypt$${salt.toString('hex')}$${h.toString('hex')}`;
}
// Zelfde rekentijd voor onbekende e-mailadressen, zodat niet te zien is of een account bestaat
const DUMMY = 'scrypt$' + '0'.repeat(32) + '$' + '0'.repeat(128);
export async function checkPassword(pw, stored) {
  const [alg, s, h] = String(stored || DUMMY).split('$');
  if (alg !== 'scrypt' || !s || !h) return false;
  const calc = await scrypt(String(pw), Buffer.from(s, 'hex'), 64, SCRYPT);
  const want = Buffer.from(h, 'hex');
  return Boolean(stored) && want.length === calc.length && timingSafeEqual(want, calc);
}
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

// ---------- Sessies ----------
const COOKIE = 'sf_sid';
const DAYS = 30;
const readSid = h => { const m = /(?:^|;\s*)sf_sid=([a-f0-9]{64})(?:;|$)/.exec(h || ''); return m ? m[1] : null; };

export function sessionMiddleware(req, res, next) {
  const sid = readSid(req.headers.cookie);
  req.session = null; req.user = null;
  if (sid) {
    const s = one(`SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`, sid);
    if (s) {
      req.session = s;
      if (s.user_id) req.user = one('SELECT id, email, role, first_name, last_name, phone, company, street, postcode, city, country FROM users WHERE id = ?', s.user_id);
    }
  }
  // Maak pas een sessie aan als het nodig is (winkelmand, inloggen)
  req.ensureSession = () => {
    if (req.session) return req.session;
    const id = randomBytes(32).toString('hex');
    run(`INSERT INTO sessions (id, csrf, expires_at) VALUES (?, ?, datetime('now', '+${DAYS} days'))`, id, randomBytes(16).toString('hex'));
    req.session = one('SELECT * FROM sessions WHERE id = ?', id);
    setCookie(req, res, id);
    return req.session;
  };
  next();
}
function setCookie(req, res, id, maxAge = DAYS * 86400) {
  const secure = req.secure || process.env.COOKIE_SECURE === '1' || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append('Set-Cookie', `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

// Na inloggen: nieuwe sessie-id (tegen session fixation), winkelmand gaat mee
export function loginUser(req, res, userId) {
  const old = req.session?.id;
  const id = randomBytes(32).toString('hex');
  run(`INSERT INTO sessions (id, user_id, csrf, expires_at) VALUES (?, ?, ?, datetime('now', '+${DAYS} days'))`, id, userId, randomBytes(16).toString('hex'));
  if (old) {
    run(`INSERT INTO cart_items (session_id, product_id, qty) SELECT ?, product_id, qty FROM cart_items WHERE session_id = ?
         ON CONFLICT(session_id, product_id) DO UPDATE SET qty = excluded.qty`, id, old);
    run('DELETE FROM sessions WHERE id = ?', old);
  }
  // Bewaarde winkelmand van de vorige sessie van deze klant (alleen de meest recente)
  const prev = one(`SELECT s.id FROM sessions s WHERE s.user_id = ? AND s.id != ? AND EXISTS (SELECT 1 FROM cart_items WHERE session_id = s.id) ORDER BY s.created_at DESC LIMIT 1`, userId, id);
  if (prev) run(`INSERT INTO cart_items (session_id, product_id, qty) SELECT ?, product_id, qty FROM cart_items WHERE session_id = ?
       ON CONFLICT(session_id, product_id) DO NOTHING`, id, prev.id);
  run(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`, userId);
  setCookie(req, res, id);
  req.session = one('SELECT * FROM sessions WHERE id = ?', id);
}
export function logoutUser(req, res) {
  if (req.session) run('DELETE FROM sessions WHERE id = ?', req.session.id);
  setCookie(req, res, '', 0);
}

// Beveiliging: POST alleen vanaf onze eigen site
export function sameOrigin(req, res, next) {
  if (req.method !== 'POST') return next();
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = new Set([req.headers.host, req.headers['x-forwarded-host']].filter(Boolean));
  if (process.env.SITE_URL) try { allowed.add(new URL(process.env.SITE_URL).host); } catch {}
  try {
    if (allowed.has(new URL(origin).host)) return next();
  } catch {}
  res.status(403).send('Verzoek geweigerd.');
}

// Eenvoudige rem op inlogpogingen (per IP + e-mail)
// (Bij meerdere servers: verplaatsen naar de database.)
const attempts = new Map();
const WINDOW = 15 * 60_000;
export function tooManyAttempts(key, max = 8) {
  const now = Date.now(), a = (attempts.get(key) || []).filter(t => now - t < WINDOW);
  if (a.length) attempts.set(key, a); else attempts.delete(key);
  return a.length >= max;
}
export const noteAttempt = key => attempts.set(key, [...(attempts.get(key) || []), Date.now()].slice(-50));
export const clearAttempts = key => attempts.delete(key);
setInterval(() => { const now = Date.now(); for (const [k, a] of attempts) if (!a.some(t => now - t < WINDOW)) attempts.delete(k); }, 5 * 60_000).unref();

export const requireUser = (req, res, next) => req.user ? next() : res.redirect('/account/inloggen?terug=' + encodeURIComponent(req.originalUrl));
export const requireAdmin = (req, res, next) => req.user?.role === 'beheerder' ? next() : (req.user ? res.status(403).send('Geen toegang.') : res.redirect('/account/inloggen?terug=' + encodeURIComponent(req.originalUrl)));

// Flash-berichten via querystring (?melding=...)
export const MESSAGES = Object.assign(Object.create(null), {
  welkom: 'Welkom! Je account is aangemaakt.',
  ingelogd: 'Je bent ingelogd.',
  uitgelogd: 'Je bent uitgelogd.',
  opgeslagen: 'Je wijzigingen zijn opgeslagen.',
  wachtwoord: 'Je wachtwoord is gewijzigd.',
  reset: 'Als dit e-mailadres bij ons bekend is, ontvang je een link om je wachtwoord te herstellen.',
  hersteld: 'Je wachtwoord is hersteld. Je kunt nu inloggen.',
  toegevoegd: 'Toegevoegd aan je winkelmand.',
});

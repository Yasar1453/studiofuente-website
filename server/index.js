import express from 'express';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { db, one, all, run, tx, ROOT } from './db.js';
import {
  sessionMiddleware, sameOrigin, loginUser, logoutUser, requireUser, requireAdmin,
  hashPassword, checkPassword, validEmail, tooManyAttempts, noteAttempt, clearAttempts, ORDER_STATUS,
} from './lib.js';
import * as P from './views/pages.js';
import * as S from './views/shop.js';
import * as A from './views/account.js';
import * as B from './views/admin.js';
import { shopCategories, SITE } from './views/layout.js';
import { paymentsEnabled } from './payments.js';
import * as PL from './planning.js';
import { normSlug, importAll } from './import.js';

// .env inlezen (simpel, zonder extra pakket)
const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) for (const l of readFileSync(envFile, 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

// Eerste start: database vullen
if (!one('SELECT COUNT(*) n FROM products').n) importAll();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
  next();
});
app.use(express.static(path.join(ROOT, 'public'), { maxAge: '7d', index: false }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => { req.body ??= {}; next(); });
app.use(sessionMiddleware);
app.use(sameOrigin);

const send = (res, page, status = 200) => res.status(status).type('html').send(String(page));
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const eurosToCents = v => {
  let t = String(v ?? '').replace(/[€\s]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');          // 1.234,56
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');         // 1.234
  const n = parseFloat(t);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const has = (obj, k) => typeof k === 'string' && Object.hasOwn(obj, k);

// ---------- Productdata ----------
const firstImg = `(SELECT json_object('local_path', local_path, 'remote_url', remote_url) FROM product_images WHERE product_id = p.id ORDER BY pos LIMIT 1)`;
const secondImg = `(SELECT json_object('local_path', local_path, 'remote_url', remote_url) FROM product_images WHERE product_id = p.id AND pos = 1)`;
const withImgs = rows => rows.map(r => ({ ...r, img: r.img ? JSON.parse(r.img) : null, img2: r.img2 ? JSON.parse(r.img2) : null }));

function getCart(req) {
  if (!req.session) return { lines: [], subtotal: 0, count: 0 };
  const lines = withImgs(all(`SELECT ci.product_id, ci.qty, p.slug, p.name, p.price, p.unit, ${firstImg} img
    FROM cart_items ci JOIN products p ON p.id = ci.product_id AND p.visible = 1 AND p.price > 0 WHERE ci.session_id = ? ORDER BY p.name`, req.session.id));
  return { lines, subtotal: lines.reduce((s, l) => s + l.price * l.qty, 0), count: lines.length };
}

// ---------- Website ----------
app.get('/', (req, res) => {
  const featured = withImgs(all(`SELECT p.*, ${firstImg} img, ${secondImg} img2 FROM products p WHERE visible = 1 AND featured = 1 ORDER BY brand = 'Oppio', id DESC LIMIT 8`));
  send(res, P.home(req, featured));
});
app.get('/diensten', (req, res) => send(res, P.diensten(req)));
app.get('/diensten/:slug', (req, res) => {
  const sv = P.SERVICES.find(x => x.slug === req.params.slug);
  if (!sv) return send(res, P.notFound(req), 404);
  const cat = sv.shop ? one('SELECT id FROM categories WHERE slug = ?', sv.shop.split('/').pop()) : null;
  const products = cat ? withImgs(all(`SELECT p.*, ${firstImg} img, ${secondImg} img2 FROM products p WHERE visible = 1 AND id IN
    (SELECT product_id FROM product_categories WHERE category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?))
    ORDER BY featured DESC, (SELECT local_path IS NOT NULL FROM product_images WHERE product_id = p.id ORDER BY pos LIMIT 1) DESC, id DESC LIMIT 4`, cat.id, cat.id)) : [];
  send(res, P.dienst(req, sv, products));
});
app.get('/contact', (req, res) => send(res, P.contact(req, { sent: req.query.verzonden === '1' })));
app.post('/contact', (req, res) => {
  const b = req.body, errors = {};
  if (b.website) return res.redirect(303, '/contact?verzonden=1');
  if (!clean(b.naam)) errors.naam = 1;
  if (!validEmail(b.email)) errors.email = 1;
  if (!clean(b.bericht)) errors.bericht = 1;
  if (Object.keys(errors).length) return send(res, P.contact(req, { values: b, errors }), 422);
  run(`INSERT INTO appointments (kind, name, email, phone, topic, message, user_id) VALUES ('vraag',?,?,?,?,?,?)`,
    clean(b.naam, 120), clean(b.email, 160), clean(b.telefoon, 40), clean(b.onderwerp, 60), clean(b.bericht, 4000), req.user?.id || null);
  res.redirect(303, '/contact?verzonden=1');
});
app.get('/showroom', (req, res) => send(res, P.showroom(req)));
app.get('/projecten', (req, res) => send(res, P.projecten(req)));
app.get('/over-fuente', (req, res) => send(res, P.overFuente(req)));
app.get('/journaal', (req, res) => send(res, P.journaal(req)));
app.get('/journaal/:slug', (req, res) => {
  const a = P.ARTICLES.find(x => x.slug === req.params.slug);
  if (!a) return send(res, P.notFound(req), 404);
  send(res, P.artikel(req, a));
});
app.get('/afspraak', (req, res) => send(res, P.afspraak(req, { sent: req.query.verzonden === '1' })));
app.get('/afspraak/tijden', (req, res) => {
  res.set('Cache-Control', 'no-store').json({ tijden: PL.slots(clean(req.query.met, 20), +req.query.duur, clean(req.query.datum, 10)) });
});
app.post('/afspraak', (req, res) => {
  const b = req.body, errors = {};
  if (b.website) return res.redirect(303, '/afspraak?verzonden=1'); // spam
  const met = clean(b.met, 20), duur = +b.duur, datum = clean(b.datum, 10), tijd = clean(b.tijd, 5);
  if (!PL.staffById(met)) errors.met = 1;
  if (!PL.durationByMin(duur)) errors.duur = 1;
  if (!PL.validDay(datum)) errors.datum = 1;
  if (!errors.met && !errors.duur && !errors.datum && !PL.slotFree(met, duur, datum, tijd)) errors.tijd = 1;
  if (!clean(b.naam)) errors.naam = 1;
  if (!validEmail(b.email)) errors.email = 1;
  if (Object.keys(errors).length) return send(res, P.afspraak(req, { values: b, errors }), 422);
  const wie = PL.staffById(met).name;
  run(`INSERT INTO appointments (name, email, phone, topic, preferred, message, user_id, staff, duration, date, time) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    clean(b.naam, 120), clean(b.email, 160), clean(b.telefoon, 40), clean(b.onderwerp, 60),
    `${wie} · ${PL.dateLong(datum)} om ${tijd} · ${PL.durationByMin(duur).label}`, clean(b.bericht, 2000), req.user?.id || null, met, duur, datum, tijd);
  res.redirect(303, `/afspraak?verzonden=1&met=${met}&datum=${datum}&tijd=${encodeURIComponent(tijd)}`);
});
app.get('/algemene-voorwaarden', (req, res) => send(res, P.legal(req, one(`SELECT * FROM pages WHERE slug = 'algemene-voorwaarden'`), 'Algemene voorwaarden')));
app.get(['/privacy', '/privacy-policy'], (req, res) => send(res, P.legal(req, one(`SELECT * FROM pages WHERE slug = 'privacy-policy'`), 'Privacy')));

// ---------- Winkel ----------
const PER_PAGE = 24;
const ORDER_BY = { populair: "p.featured DESC, (SELECT local_path IS NOT NULL FROM product_images WHERE product_id = p.id ORDER BY pos LIMIT 1) DESC, p.id DESC", nieuw: 'p.id DESC', 'prijs-op': 'p.price ASC', 'prijs-af': 'p.price DESC', naam: 'p.name COLLATE NOCASE' };

app.get(['/producten', '/producten/:cat'], (req, res) => {
  const cats = shopCategories();
  let current = null, sub = [];
  if (req.params.cat) {
    current = one('SELECT * FROM categories WHERE slug = ?', req.params.cat);
    if (!current) return send(res, P.notFound(req), 404);
    const top = current.parent_id ? one('SELECT * FROM categories WHERE id = ?', current.parent_id) : current;
    sub = all(`SELECT c.* FROM categories c WHERE parent_id = ? AND EXISTS (SELECT 1 FROM product_categories pc WHERE pc.category_id = c.id) ORDER BY name`, top.id);
    if (sub.length) sub = [{ ...top, name: 'Alle ' + top.name.toLowerCase() }, ...sub];
  }
  const q = clean(req.query.q, 80), merk = clean(req.query.merk, 40);
  const sort = has(ORDER_BY, req.query.sort) ? req.query.sort : 'populair';
  const where = ['p.visible = 1'], args = [];
  if (current) {
    where.push(`p.id IN (SELECT product_id FROM product_categories WHERE category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?))`);
    args.push(current.id, current.id);
  }
  if (q) for (const w of q.split(/\s+/).slice(0, 5)) { where.push('(p.name LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?)'); args.push(`%${w}%`, `%${w}%`, `%${w}%`); }
  const brandWhere = where.join(' AND '), brandArgs = [...args];
  if (merk) { where.push('p.brand = ?'); args.push(merk); }
  const W = where.join(' AND ');
  const total = one(`SELECT COUNT(*) n FROM products p WHERE ${W}`, ...args).n;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(req.query.pagina) || 1));
  const products = withImgs(all(`SELECT p.*, ${firstImg} img, ${secondImg} img2 FROM products p WHERE ${W} ORDER BY ${ORDER_BY[sort]} LIMIT ? OFFSET ?`, ...args, PER_PAGE, (page - 1) * PER_PAGE));
  const brands = all(`SELECT DISTINCT p.brand FROM products p WHERE ${brandWhere} AND p.brand != '' ORDER BY p.brand`, ...brandArgs).map(r => r.brand);
  send(res, S.productList(req, { cats, current, sub, brands, products, total, page, pages, q, sort, merk }));
});

app.get('/product/:slug', (req, res) => {
  const p = one('SELECT * FROM products WHERE slug = ? AND visible = 1', req.params.slug);
  if (!p) {
    // Oude WooCommerce-link of slug met m² -> nette URL
    const alt = one('SELECT slug FROM products WHERE slug = ? AND visible = 1', normSlug(req.params.slug));
    return alt ? res.redirect(301, '/product/' + alt.slug) : send(res, P.notFound(req), 404);
  }
  const images = all('SELECT * FROM product_images WHERE product_id = ? ORDER BY pos', p.id);
  const cats = all(`SELECT c.* FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ? ORDER BY c.parent_id IS NOT NULL DESC, c.sort`, p.id);
  const related = withImgs(all(`SELECT p.*, ${firstImg} img, ${secondImg} img2 FROM products p WHERE visible = 1 AND id != ? AND id IN
    (SELECT product_id FROM product_categories WHERE category_id = ?) ORDER BY abs(price - ?) LIMIT 4`, p.id, cats[0]?.id || 0, p.price));
  send(res, S.productDetail(req, { p, images, cats, related }));
});

// Winkelmand
const wantsJson = req => (req.headers.accept || '').includes('application/json');
const cartJson = req => { const cart = getCart(req); return { count: cart.count, subtotal: cart.subtotal, html: String(S.cartDrawer(cart)) }; };

app.get('/winkelmand', (req, res) => { res.vary('Accept').set('Cache-Control', 'no-store'); wantsJson(req) ? res.json(cartJson(req)) : send(res, S.cartPage(req, getCart(req))); });
app.post('/winkelmand/toevoegen', (req, res) => {
  const p = one('SELECT id, slug FROM products WHERE id = ? AND visible = 1 AND price > 0', parseInt(req.body.product));
  if (!p) return res.status(404).json({ error: 'Product niet gevonden' });
  const qty = Math.min(999, Math.max(1, parseInt(req.body.aantal) || 1));
  const s = req.ensureSession();
  run(`INSERT INTO cart_items (session_id, product_id, qty) VALUES (?,?,?)
       ON CONFLICT(session_id, product_id) DO UPDATE SET qty = MIN(999, qty + excluded.qty)`, s.id, p.id, qty);
  wantsJson(req) ? res.json(cartJson(req)) : res.redirect(303, '/winkelmand');
});
app.post('/winkelmand/bijwerken', (req, res) => {
  if (req.session) {
    const qty = Math.min(999, Math.max(0, parseInt(req.body.aantal ?? req.body.invoer) || 0));
    const pid = parseInt(req.body.product);
    if (qty === 0) run('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?', req.session.id, pid);
    else run('UPDATE cart_items SET qty = ? WHERE session_id = ? AND product_id = ?', qty, req.session.id, pid);
  }
  wantsJson(req) ? res.json(cartJson(req)) : res.redirect(303, req.get('referer')?.includes('/winkelmand') ? '/winkelmand' : '/winkelmand');
});

// Afrekenen
app.get('/afrekenen', (req, res) => {
  const cart = getCart(req);
  if (!cart.lines.length) return res.redirect('/winkelmand');
  send(res, S.checkoutPage(req, { cart, paymentsEnabled: paymentsEnabled() }));
});

function nextOrderNumber() {
  const y = new Date().getFullYear();
  const last = one(`SELECT number FROM orders WHERE number LIKE ? ORDER BY id DESC LIMIT 1`, `SF${y}-%`);
  const n = last ? parseInt(last.number.split('-')[1]) + 1 : 1;
  return `SF${y}-${String(n).padStart(4, '0')}`;
}

app.post('/afrekenen', async (req, res) => {
  const cart = getCart(req);
  if (!cart.lines.length) return res.redirect(303, '/winkelmand');
  const b = req.body, errors = {};
  const pickup = b.levering === 'ophalen';
  const email = clean(b.email, 160).toLowerCase();
  if (!validEmail(email)) errors.email = 1;
  for (const k of ['voornaam', 'achternaam', 'telefoon', ...(pickup ? [] : ['straat', 'postcode', 'plaats'])]) if (!clean(b[k])) errors[k] = 1;
  if (!b.voorwaarden) errors.voorwaarden = 1;
  let newUserId = null;
  if (!req.user && b.account) {
    if (String(b.wachtwoord || '').length < 8) errors.wachtwoord = 1;
    else if (one('SELECT 1 FROM users WHERE email = ?', email)) errors.email = 1;
  }
  if (Object.keys(errors).length) return send(res, S.checkoutPage(req, { cart, values: b, errors, paymentsEnabled: paymentsEnabled() }), 422);
  if (!req.user && b.account && tooManyAttempts('reg|' + req.ip, 10)) return send(res, S.checkoutPage(req, { cart, values: { ...b, account: '' }, errors: {}, paymentsEnabled: paymentsEnabled() }), 429);
  const pwHash = !req.user && b.account ? await hashPassword(b.wachtwoord) : null;

  const order = tx(() => {
    if (!req.user && b.account) {
      newUserId = run(`INSERT INTO users (email, password_hash, first_name, last_name, phone, company, street, postcode, city) VALUES (?,?,?,?,?,?,?,?,?)`,
        email, pwHash, clean(b.voornaam), clean(b.achternaam), clean(b.telefoon, 40), clean(b.bedrijf), clean(b.straat), clean(b.postcode, 12), clean(b.plaats)).lastInsertRowid;
    }
    const userId = req.user?.id || newUserId || null; // gast blijft gast, ook als het e-mailadres een account heeft
    const number = nextOrderNumber();
    const id = run(`INSERT INTO orders (number, user_id, delivery, email, first_name, last_name, phone, company, street, postcode, city, country, note, subtotal, shipping, total)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)`,
      number, userId, pickup ? 'ophalen' : 'bezorgen', email, clean(b.voornaam), clean(b.achternaam), clean(b.telefoon, 40), clean(b.bedrijf),
      pickup ? '' : clean(b.straat), pickup ? '' : clean(b.postcode, 12), pickup ? '' : clean(b.plaats), 'NL', clean(b.opmerking, 2000), cart.subtotal, cart.subtotal).lastInsertRowid;
    for (const l of cart.lines) run('INSERT INTO order_items (order_id, product_id, name, unit, price, qty) VALUES (?,?,?,?,?,?)', id, l.product_id, l.name, l.unit, l.price, l.qty);
    run('INSERT INTO order_events (order_id, text) VALUES (?, ?)', id, 'Bestelling geplaatst');
    run('DELETE FROM cart_items WHERE session_id = ?', req.session.id);
    if (userId) run('DELETE FROM cart_items WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?)', userId);
    // Gegevens bewaren in het account
    if (req.user) run(`UPDATE users SET first_name = COALESCE(NULLIF(first_name,''), ?), last_name = COALESCE(NULLIF(last_name,''), ?), phone = COALESCE(NULLIF(phone,''), ?),
      street = COALESCE(NULLIF(street,''), ?), postcode = COALESCE(NULLIF(postcode,''), ?), city = COALESCE(NULLIF(city,''), ?) WHERE id = ?`,
      clean(b.voornaam), clean(b.achternaam), clean(b.telefoon, 40), clean(b.straat), clean(b.postcode, 12), clean(b.plaats), req.user.id);
    return one('SELECT * FROM orders WHERE id = ?', id);
  });
  if (newUserId) loginUser(req, res, newUserId);
  // Gast: alleen deze sessie mag de bevestiging zien
  run('INSERT OR IGNORE INTO guest_orders (session_id, order_id) VALUES (?, ?)', req.session.id, order.id);
  console.log(`[bestelling] ${order.number} ${order.email} ${order.total / 100} EUR`);
  res.redirect(303, `/bestelling/${order.number}`);
});

app.get('/bestelling/:number', (req, res) => {
  const order = one('SELECT * FROM orders WHERE number = ?', req.params.number);
  const mine = order && ((req.user && order.user_id === req.user.id) || (req.session && one('SELECT 1 FROM guest_orders WHERE session_id = ? AND order_id = ?', req.session.id, order.id)));
  if (!mine) return send(res, P.notFound(req), 404);
  send(res, S.orderDone(req, { order, items: all('SELECT * FROM order_items WHERE order_id = ?', order.id), events: all('SELECT * FROM order_events WHERE order_id = ? ORDER BY id', order.id) }));
});

// ---------- Account ----------
const safeBack = v => {
  if (typeof v !== 'string' || !v.startsWith('/') || /[\\\x00-\x1f]/.test(v)) return '';
  try { const u = new URL(v, 'http://x'); return u.origin === 'http://x' ? u.pathname + u.search : ''; } catch { return ''; }
};

app.get('/account/inloggen', (req, res) => req.user ? res.redirect('/account') : send(res, A.loginPage(req, { back: safeBack(req.query.terug) })));
app.post('/account/inloggen', async (req, res) => {
  const email = clean(req.body.email, 160).toLowerCase(), back = safeBack(req.body.terug);
  const key = `${req.ip}|${email}`;
  if (tooManyAttempts(key) || tooManyAttempts('mail|' + email, 20)) return send(res, A.loginPage(req, { error: 'Te veel pogingen. Probeer het over een kwartier opnieuw.', email, back }), 429);
  const u = one('SELECT * FROM users WHERE email = ?', email);
  if (!(await checkPassword(req.body.wachtwoord || '', u?.password_hash))) {
    noteAttempt(key); noteAttempt('mail|' + email);
    return send(res, A.loginPage(req, { error: 'E-mail of wachtwoord klopt niet.', email, back }), 401);
  }
  clearAttempts(key);
  loginUser(req, res, u.id);
  res.redirect(303, back || (u.role === 'beheerder' ? '/beheer' : '/account?melding=ingelogd'));
});
app.post('/account/uitloggen', (req, res) => { logoutUser(req, res); res.redirect(303, '/?melding=uitgelogd'); });

app.get('/account/registreren', (req, res) => req.user ? res.redirect('/account') : send(res, A.registerPage(req, { back: safeBack(req.query.terug) })));
app.post('/account/registreren', async (req, res) => {
  const b = req.body, email = clean(b.email, 160).toLowerCase(), back = safeBack(b.terug);
  let error;
  if (tooManyAttempts('reg|' + req.ip, 10)) return send(res, A.registerPage(req, { error: 'Te veel pogingen. Probeer het later opnieuw.', values: b, back }), 429);
  noteAttempt('reg|' + req.ip);
  if (!clean(b.voornaam) || !clean(b.achternaam)) error = 'Vul je voor- en achternaam in.';
  else if (!validEmail(email)) error = 'Vul een geldig e-mailadres in.';
  else if (String(b.wachtwoord || '').length < 8) error = 'Kies een wachtwoord van minimaal 8 tekens.';
  else if (!b.voorwaarden) error = 'Ga akkoord met de voorwaarden om verder te gaan.';
  else if (one('SELECT 1 FROM users WHERE email = ?', email)) error = 'Er bestaat al een account met dit e-mailadres. Log in of herstel je wachtwoord.';
  if (error) return send(res, A.registerPage(req, { error, values: b, back }), 422);
  const id = run('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?,?,?,?)', email, await hashPassword(b.wachtwoord), clean(b.voornaam), clean(b.achternaam)).lastInsertRowid;
  loginUser(req, res, id);
  res.redirect(303, back || '/account?melding=welkom');
});

app.get('/account/wachtwoord-vergeten', (req, res) => send(res, A.forgotPage(req)));
app.post('/account/wachtwoord-vergeten', (req, res) => {
  if (tooManyAttempts('reset|' + req.ip, 6)) return res.redirect(303, '/account/inloggen?melding=reset');
  noteAttempt('reset|' + req.ip);
  const u = one('SELECT id, email FROM users WHERE email = ?', clean(req.body.email, 160).toLowerCase());
  if (u) {
    const token = randomBytes(32).toString('hex');
    run(`INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+1 hour'))`, token, u.id);
    // TODO: versturen per e-mail zodra er een mailkoppeling is.
    console.log(`[wachtwoord-herstel] ${u.email}: ${req.protocol}://${req.get('host')}/account/herstel/${token}`);
  }
  res.redirect(303, '/account/inloggen?melding=reset');
});
app.get('/account/herstel/:token', (req, res) => {
  const r = one(`SELECT * FROM password_resets WHERE token = ? AND expires_at > datetime('now')`, req.params.token);
  if (!r) return send(res, A.forgotPage(req, { error: 'Deze link is verlopen. Vraag een nieuwe aan.' }), 410);
  send(res, A.resetPage(req, { token: req.params.token }));
});
app.post('/account/herstel/:token', async (req, res) => {
  const r = one(`SELECT * FROM password_resets WHERE token = ? AND expires_at > datetime('now')`, req.params.token);
  if (!r) return send(res, A.forgotPage(req, { error: 'Deze link is verlopen. Vraag een nieuwe aan.' }), 410);
  if (String(req.body.wachtwoord || '').length < 8) return send(res, A.resetPage(req, { token: req.params.token, error: 'Minimaal 8 tekens.' }), 422);
  const hash = await hashPassword(req.body.wachtwoord);
  tx(() => {
    run('UPDATE users SET password_hash = ? WHERE id = ?', hash, r.user_id);
    run('DELETE FROM password_resets WHERE user_id = ?', r.user_id);
    run('DELETE FROM sessions WHERE user_id = ?', r.user_id);
  });
  res.redirect(303, '/account/inloggen?melding=hersteld');
});

app.get('/account', requireUser, (req, res) => send(res, A.accountOverview(req, all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', req.user.id))));
app.get('/account/bestelling/:number', requireUser, (req, res) => {
  const o = one('SELECT * FROM orders WHERE number = ? AND user_id = ?', req.params.number, req.user.id);
  if (!o) return send(res, P.notFound(req), 404);
  send(res, A.accountOrder(req, o, all('SELECT * FROM order_items WHERE order_id = ?', o.id), all('SELECT * FROM order_events WHERE order_id = ? ORDER BY id', o.id)));
});
app.get('/account/afspraken', requireUser, (req, res) => send(res, A.accountAppointments(req, all('SELECT * FROM appointments WHERE user_id = ? ORDER BY id DESC', req.user.id))));
app.get('/account/gegevens', requireUser, (req, res) => send(res, A.accountDetails(req)));
app.post('/account/gegevens', requireUser, (req, res) => {
  const b = req.body;
  run(`UPDATE users SET first_name=?, last_name=?, phone=?, company=?, street=?, postcode=?, city=? WHERE id=?`,
    clean(b.voornaam), clean(b.achternaam), clean(b.telefoon, 40), clean(b.bedrijf), clean(b.straat), clean(b.postcode, 12), clean(b.plaats), req.user.id);
  res.redirect(303, '/account/gegevens?melding=opgeslagen');
});
app.post('/account/wachtwoord', requireUser, async (req, res) => {
  const u = one('SELECT password_hash FROM users WHERE id = ?', req.user.id);
  if (!(await checkPassword(req.body.huidig || '', u.password_hash))) return send(res, A.accountDetails(req, { error: 'Je huidige wachtwoord klopt niet.' }), 422);
  if (String(req.body.nieuw || '').length < 8) return send(res, A.accountDetails(req, { error: 'Kies een nieuw wachtwoord van minimaal 8 tekens.' }), 422);
  run('UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(req.body.nieuw), req.user.id);
  run('DELETE FROM sessions WHERE user_id = ? AND id != ?', req.user.id, req.session.id);
  res.redirect(303, '/account/gegevens?melding=wachtwoord');
});

// ---------- Beheer ----------
const adm = express.Router();
adm.use(requireAdmin);
const badges = () => ({
  bestellingen: one(`SELECT COUNT(*) n FROM orders WHERE status IN ('wacht_op_betaling','betaald','in_behandeling')`).n,
  afspraken: one(`SELECT COUNT(*) n FROM appointments WHERE status = 'nieuw'`).n,
});

adm.get('/', (req, res) => {
  const month = one(`SELECT COALESCE(SUM(total),0) s, COUNT(*) n FROM orders WHERE status != 'geannuleerd' AND created_at >= date('now','start of month')`);
  send(res, B.dashboard(req, {
    revenueMonth: month.s, ordersMonth: month.n,
    open: one(`SELECT COUNT(*) n FROM orders WHERE status IN ('wacht_op_betaling','betaald','in_behandeling')`).n,
    newAppointments: one(`SELECT COUNT(*) n FROM appointments WHERE status = 'nieuw'`).n,
    customers: one(`SELECT COUNT(*) n FROM users WHERE role = 'klant'`).n,
    products: one('SELECT COUNT(*) n FROM products WHERE visible = 1').n,
    recentOrders: all('SELECT * FROM orders ORDER BY id DESC LIMIT 6'),
    recentAppointments: all('SELECT * FROM appointments ORDER BY id DESC LIMIT 6'),
    paymentsOff: !paymentsEnabled(), badges: badges(),
    legalTodo: Boolean(one(`SELECT 1 FROM pages WHERE html LIKE '%Kvk:%' AND html NOT LIKE '%Kvk: 0%' AND html NOT GLOB '*Kvk:*[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]*'`)),
  }));
});

adm.get('/bestellingen', (req, res) => {
  const status = has(ORDER_STATUS, req.query.status) ? req.query.status : '';
  const q = clean(req.query.q, 80);
  const where = ['1=1'], args = [];
  if (status) { where.push('status = ?'); args.push(status); }
  if (q) { where.push(`(number LIKE ? OR email LIKE ? OR (first_name || ' ' || last_name) LIKE ?)`); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const counts = { all: one('SELECT COUNT(*) n FROM orders').n };
  for (const r of all('SELECT status, COUNT(*) n FROM orders GROUP BY status')) counts[r.status] = r.n;
  send(res, B.ordersPage(req, { orders: all(`SELECT * FROM orders WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT 200`, ...args), status, counts, q }));
});
adm.get('/bestellingen/:number', (req, res) => {
  const order = one('SELECT * FROM orders WHERE number = ?', req.params.number);
  if (!order) return res.redirect('/beheer/bestellingen');
  send(res, B.orderPage(req, { order, items: all('SELECT * FROM order_items WHERE order_id = ?', order.id), events: all('SELECT * FROM order_events WHERE order_id = ? ORDER BY id DESC', order.id), customer: order.user_id ? one('SELECT id FROM users WHERE id = ?', order.user_id) : null }));
});
adm.post('/bestellingen/:number', (req, res) => {
  const o = one('SELECT * FROM orders WHERE number = ?', req.params.number);
  if (!o) return res.redirect(303, '/beheer/bestellingen');
  const status = has(ORDER_STATUS, req.body.status) ? req.body.status : o.status;
  const pay = ['open', 'betaald', 'terugbetaald'].includes(req.body.betaling) ? req.body.betaling : o.payment_status;
  const shipping = Math.max(0, eurosToCents(req.body.verzendkosten));
  tx(() => {
    run(`UPDATE orders SET status=?, payment_status=?, shipping=?, total=subtotal+?, updated_at=datetime('now') WHERE id=?`, status, pay, shipping, shipping, o.id);
    if (status !== o.status) run('INSERT INTO order_events (order_id, text, by_user) VALUES (?,?,?)', o.id, `Status: ${ORDER_STATUS[status]}`, req.user.id);
    if (pay !== o.payment_status) run('INSERT INTO order_events (order_id, text, by_user) VALUES (?,?,?)', o.id, `Betaling: ${pay}`, req.user.id);
    if (shipping !== o.shipping) run('INSERT INTO order_events (order_id, text, by_user) VALUES (?,?,?)', o.id, `Verzendkosten: € ${(shipping / 100).toFixed(2).replace('.', ',')}`, req.user.id);
    const note = clean(req.body.notitie, 500);
    if (note) run('INSERT INTO order_events (order_id, text, by_user) VALUES (?,?,?)', o.id, note, req.user.id);
  });
  res.redirect(303, `/beheer/bestellingen/${o.number}?melding=opgeslagen`);
});

adm.get('/producten', (req, res) => {
  const q = clean(req.query.q, 80), cat = parseInt(req.query.cat) || '', vis = ['0', '1'].includes(req.query.vis) ? req.query.vis : '';
  const where = ['1=1'], args = [];
  if (q) { where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (cat) { where.push('p.id IN (SELECT product_id FROM product_categories WHERE category_id = ?)'); args.push(cat); }
  if (vis) { where.push('p.visible = ?'); args.push(+vis); }
  const total = one(`SELECT COUNT(*) n FROM products p WHERE ${where.join(' AND ')}`, ...args).n;
  const pages = Math.max(1, Math.ceil(total / 50)), page = Math.min(pages, Math.max(1, parseInt(req.query.pagina) || 1));
  const products = withImgs(all(`SELECT p.*, ${firstImg} img, (SELECT group_concat(c.name, ', ') FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = p.id) cats
    FROM products p WHERE ${where.join(' AND ')} ORDER BY p.id DESC LIMIT 50 OFFSET ?`, ...args, (page - 1) * 50));
  send(res, B.productsPage(req, { products, total, page, pages, q, cat, vis, cats: all('SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, name') }));
});
adm.get('/producten/:id', (req, res) => {
  const p = one('SELECT * FROM products WHERE id = ?', parseInt(req.params.id));
  if (!p) return res.redirect('/beheer/producten');
  send(res, B.productEdit(req, { p, images: all('SELECT * FROM product_images WHERE product_id = ? ORDER BY pos', p.id),
    cats: all('SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, name'),
    selected: all('SELECT category_id FROM product_categories WHERE product_id = ?', p.id).map(r => r.category_id) }));
});
adm.post('/producten/:id', (req, res) => {
  const id = parseInt(req.params.id), b = req.body;
  if (!one('SELECT 1 FROM products WHERE id = ?', id)) return res.redirect(303, '/beheer/producten');
  const specs = String(b.specs || '').split('\n').map(l => l.split(':')).filter(a => a.length > 1).map(([k, ...v]) => [k.trim(), v.join(':').trim()]).filter(([k, v]) => k && v);
  const cats = [].concat(b.cat || []).map(Number).filter(Boolean);
  tx(() => {
    run(`UPDATE products SET name=?, price=?, unit=?, brand=?, sku=?, description=?, specs=?, visible=?, featured=?, stock_status=?, updated_at=datetime('now') WHERE id=?`,
      clean(b.naam), Math.max(0, eurosToCents(b.prijs)), ['m²', 'st', 'pak'].includes(b.eenheid) ? b.eenheid : 'st', clean(b.merk, 60), clean(b.sku, 60),
      clean(b.omschrijving, 4000), JSON.stringify(specs), b.zichtbaar ? 1 : 0, b.uitgelicht ? 1 : 0, b.voorraad === 'outofstock' ? 'outofstock' : 'instock', id);
    run('DELETE FROM product_categories WHERE product_id = ?', id);
    for (const c of cats) run('INSERT OR IGNORE INTO product_categories VALUES (?,?)', id, c);
  });
  res.redirect(303, `/beheer/producten/${id}?melding=opgeslagen`);
});
adm.post('/producten/:id/zichtbaar', (req, res) => {
  run('UPDATE products SET visible = 1 - visible WHERE id = ?', parseInt(req.params.id));
  res.redirect(303, req.get('referer') || '/beheer/producten');
});

adm.get('/klanten', (req, res) => {
  const q = clean(req.query.q, 80);
  send(res, B.customersPage(req, { q, customers: all(`SELECT u.*, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) orders,
    (SELECT COALESCE(SUM(total),0) FROM orders WHERE user_id = u.id AND status != 'geannuleerd') spent
    FROM users u WHERE role = 'klant' ${q ? `AND (email LIKE ? OR (first_name || ' ' || last_name) LIKE ?)` : ''} ORDER BY id DESC LIMIT 500`, ...(q ? [`%${q}%`, `%${q}%`] : [])) }));
});
adm.get('/klanten/:id', (req, res) => {
  const c = one('SELECT * FROM users WHERE id = ?', parseInt(req.params.id));
  if (!c) return res.redirect('/beheer/klanten');
  send(res, B.customerPage(req, { c, orders: all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', c.id), appointments: all('SELECT * FROM appointments WHERE user_id = ? OR email = ? ORDER BY id DESC', c.id, c.email) }));
});
adm.get('/afspraken', (req, res) => send(res, B.appointmentsPage(req, { list: all('SELECT * FROM appointments ORDER BY id DESC LIMIT 300') })));
adm.post('/afspraken/:id', (req, res) => {
  if (['nieuw', 'ingepland', 'geweest', 'geannuleerd'].includes(req.body.status)) run('UPDATE appointments SET status = ? WHERE id = ?', req.body.status, parseInt(req.params.id));
  res.redirect(303, '/beheer/afspraken');
});
app.use('/beheer', adm);

// ---------- Zoekmachines ----------
app.get('/robots.txt', (req, res) => res.type('text').send(`User-agent: *\nDisallow: /beheer\nDisallow: /account\nDisallow: /winkelmand\nDisallow: /afrekenen\nDisallow: /bestelling\nSitemap: ${SITE}/sitemap.xml\n`));
app.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/producten', '/diensten', '/showroom', '/over-fuente', '/projecten', '/journaal', ...P.ARTICLES.map(x => '/journaal/' + x.slug), '/afspraak', '/contact', '/algemene-voorwaarden', '/privacy',
    ...shopCategories().map(c => '/producten/' + c.slug), ...P.SERVICES.map(s => '/diensten/' + s.slug),
    ...all('SELECT slug FROM products WHERE visible = 1').map(p => '/product/' + p.slug)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${SITE}${encodeURI(u)}</loc></url>`).join('')}</urlset>`);
});

// ---------- Fouten ----------
app.use((req, res) => send(res, P.notFound(req), 404));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).type('html').send('<p style="font-family:sans-serif;padding:40px">Er ging iets mis. Probeer het opnieuw of bel 020 303 3499.</p>');
});

// Verlopen sessies opruimen
const cleanup = () => { run(`DELETE FROM sessions WHERE expires_at < datetime('now')`); run('DELETE FROM cart_items WHERE session_id NOT IN (SELECT id FROM sessions)'); run('DELETE FROM guest_orders WHERE session_id NOT IN (SELECT id FROM sessions)'); run(`DELETE FROM password_resets WHERE expires_at < datetime('now')`); };
cleanup();
setInterval(cleanup, 3600_000).unref();

const PORT = +process.env.PORT || 8765;
// Op Netlify draait de app als functie (netlify/functions/site.mjs) en luistert hij niet zelf.
if (!process.env.KIJKVERSIE) app.listen(PORT, () => console.log(`Studio Fuente draait op http://localhost:${PORT}`));
export { app };

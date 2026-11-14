// Zet de productdata van de huidige WooCommerce-site om naar onze database.
// Gebruik:  npm run import                 (data inlezen)
//           npm run import -- --afbeeldingen (daarna rustig foto's lokaal opslaan)
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { db, run, one, all, tx, ROOT } from './db.js';

const RAW = path.join(ROOT, 'data', 'raw');
const SEED = path.join(ROOT, 'data', 'seed');
const IMG_DIR = path.join(ROOT, 'public', 'assets', 'products');

const decode = (s = '') => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'");
const strip = (h = '') => decode(h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();

function readProducts() {
  const files = existsSync(RAW) ? readdirSync(RAW).filter(f => /^products-\d+\.json$/.test(f)).sort() : [];
  const src = files.length ? files.map(f => path.join(RAW, f)) : readdirSync(SEED).filter(f => /^(cat|prod)\d+\.json$/.test(f)).map(f => path.join(SEED, f));
  const map = new Map();
  for (const f of src) for (const p of JSON.parse(readFileSync(f, 'utf8'))) map.set(p.id, p);
  console.log(`${map.size} producten uit ${files.length ? 'volledige import' : 'startset'}`);
  return [...map.values()];
}

function readCategories(products) {
  const f = path.join(RAW, 'categories.json');
  if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8')).map(c => ({ id: c.id, slug: c.slug, name: decode(c.name), parent: c.parent }));
  // Afleiden uit de producten (startset)
  const known = { 34: 32, 33: 32, 38: 32, 41: 36 };
  const m = new Map();
  for (const p of products) for (const c of p.categories) m.set(c.id, { id: c.id, slug: c.slug, name: decode(c.name), parent: known[c.id] || 0 });
  return [...m.values()];
}

function specsFrom(html) {
  const out = [];
  const re = /<strong[^>]*>(.*?)<\/strong>([\s\S]*?)(?=<br|<\/p>|<strong|$)/gi;
  let m;
  while ((m = re.exec(html))) {
    const k = strip(m[1]).replace(/:$/, '').trim(), v = strip(m[2]).replace(/^:\s*/, '').trim();
    if (k && v && k.length < 40 && v.length < 120) out.push([k, v]);
  }
  return out;
}

function pickImage(im) {
  const cand = (im.srcset || '').split(',').map(s => s.trim().split(' ')).filter(x => x[1]?.endsWith('w')).map(([u, w]) => [parseInt(w), u]);
  const big = cand.filter(c => c[0] >= 700).sort((a, b) => a[0] - b[0]);
  return big[0]?.[1] || im.src;
}

// Alleen opmaak-HTML overhouden uit WordPress
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'a', 'table', 'tr', 'td', 'th', 'thead', 'tbody']);
const escAttr = v => v.replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]));
const sanitize = h => String(h)
  .replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<\/?\s*([a-z0-9]+)\b([^>]*)>/gi, (m, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!ALLOWED.has(tag)) return '';
    if (m.startsWith('</')) return `</${tag}>`;
    if (tag === 'a') {
      const href = decode((/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs) || [])[2] || '').trim();
      return /^(https?:|mailto:|tel:|\/(?!\/))/i.test(href) ? `<a href="${escAttr(href)}" rel="noopener">` : '<a>';
    }
    return `<${tag}>`;
  })
  .replace(/<(?![a-z/])/gi, '&lt;');

// Nette weergavenaam: marketingstaart eraf, HOOFDLETTERS normaal, accenten samengevoegd
const tidyName = n => n.normalize('NFC')
  .replace(/\s*[–-]\s*Brandvertragend.*$/i, '')
  .replace(/\s+Flexibele Wandpanelen\b/i, '')
  .replace(/\s*[–-]\s*Metaal Wandpaneel\s+/i, ' Metaal ')
  .replace(/\b([A-ZÀ-Ý]{3,})\b/g, w => ['RVS', 'PVC', 'SPC'].includes(w) ? w : w[0] + w.slice(1).toLowerCase())
  .replace(/\s+[–-]\s+/g, ' ').replace(/\s+/g, ' ').trim();

// Nette URL: 'tint-fog-matt-m%c2%b2' -> 'tint-fog-matt-m2'
export const normSlug = s => { try { s = decodeURIComponent(s); } catch {} return s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); };

// Sjabloontekst uit de live voorwaarden vervangen door bekende gegevens (KvK onbekend: niet verzinnen)
const fixLegal = h => {
  // Kruimelpad ("Home") en dubbele titel van de paginabouwer eraf: begin bij de eerste alinea
  const start = h.search(/<p>/);
  return (start > 0 ? h.slice(start) : h)
    .replace(/Companyadres/g, 'Sierenborch 4, 1043 BA Amsterdam')
    .replace(/info@email\.nl/g, 'info@studiofuente.nl')
    .replace(/<p>\s*<\/p>/g, '');
};

const BRANDS = ['Cerkoni', 'Sartoria', 'Terratinta', 'Muozo', 'Oppio', 'DecoLegno'];

export function importAll() {
  const products = readProducts();
  const cats = readCategories(products);
  const order = ['vloertegel', 'wandtegel', 'pvc-vloer', 'wandpanelen', 'mozaiek', 'wandstrip', 'overige'];
  tx(() => {
    for (const c of cats) {
      run(`INSERT INTO categories (id, slug, name, parent_id, sort) VALUES (?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, parent_id=excluded.parent_id, sort=excluded.sort`,
        c.id, c.slug, c.name, c.parent || null, order.indexOf(c.slug) === -1 ? 50 : order.indexOf(c.slug));
    }
    for (const p of products) {
      const raw = decode(p.name).trim();
      const unitM = raw.match(/\s(m²|st)\.?\s*$/i);
      const catNames = p.categories.map(c => decode(c.name));
      const unit = unitM ? unitM[1].toLowerCase() : (p.categories.some(c => c.slug === 'pvc-vloer') ? 'pak' : 'st');
      const name = tidyName(raw.replace(/\s(m²|st)\.?\s*$/i, ''));
      const hay = (name + ' ' + catNames.join(' ')).toLowerCase();
      const brand = BRANDS.find(b => hay.includes(b.toLowerCase())) || '';
      const specs = specsFrom(p.description || '');
      const desc = strip(p.short_description || '') || (specs.length ? '' : strip(p.description || ''));
      const price = parseInt(p.prices?.price || '0', 10);
      const regular = parseInt(p.prices?.regular_price || '0', 10) || null;
      run(`INSERT INTO products (id, slug, name, brand, price, regular_price, unit, sku, description, specs, stock_status, source_url, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
           ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, brand=excluded.brand, price=excluded.price,
             regular_price=excluded.regular_price, unit=excluded.unit, sku=excluded.sku, description=excluded.description,
             specs=excluded.specs, stock_status=excluded.stock_status, source_url=excluded.source_url, updated_at=datetime('now')`,
        p.id, normSlug(p.slug), name, brand, price, regular, unit, p.sku || '', desc, JSON.stringify(specs),
        p.is_in_stock === false ? 'outofstock' : 'instock', p.permalink || '');
      run('DELETE FROM product_categories WHERE product_id = ?', p.id);
      for (const c of p.categories) run('INSERT OR IGNORE INTO product_categories VALUES (?,?)', p.id, c.id);
      (p.images || []).slice(0, 6).forEach((im, i) => {
        const remote = pickImage(im);
        const local = ['webp', 'jpg', 'png'].map(e => `assets/products/${p.id}-${i}.${e}`).find(f => existsSync(path.join(ROOT, 'public', f))) || null;
        run(`INSERT INTO product_images (product_id, pos, remote_url, local_path) VALUES (?,?,?,?)
             ON CONFLICT(product_id, pos) DO UPDATE SET remote_url=excluded.remote_url, local_path=COALESCE(excluded.local_path, product_images.local_path)`,
          p.id, i, remote, local);
      });
    }
    // Uitgelicht: wandpanelen en een greep uit PVC
    run(`UPDATE products SET featured = 1 WHERE id IN (
      SELECT product_id FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE c.slug IN ('wandpanelen'))
      OR id IN (SELECT product_id FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE c.slug = 'pvc-vloer' LIMIT 4)`);
  });
  // Juridische pagina's
  for (const slug of ['algemene-voorwaarden', 'privacy-policy']) {
    const f = path.join(RAW, `page-${slug}.json`);
    if (!existsSync(f)) continue;
    const [pg] = JSON.parse(readFileSync(f, 'utf8'));
    if (pg) run(`INSERT INTO pages (slug, title, html, updated_at) VALUES (?,?,?,?)
                ON CONFLICT(slug) DO UPDATE SET title=excluded.title, html=excluded.html, updated_at=excluded.updated_at`,
      slug, decode(pg.title.rendered), fixLegal(sanitize(pg.content.rendered)), pg.modified);
  }
  const n = one('SELECT COUNT(*) n FROM products').n;
  console.log(`Klaar: ${n} producten, ${one('SELECT COUNT(*) n FROM categories').n} categorieën in de database.`);
}

async function downloadImages() {
  mkdirSync(IMG_DIR, { recursive: true });
  const todo = all('SELECT id, product_id, pos, remote_url FROM product_images WHERE local_path IS NULL ORDER BY pos, product_id');
  console.log(`${todo.length} foto's op te slaan...`);
  let ok = 0;
  for (const im of todo) {
    const ext = (im.remote_url.match(/\.(webp|jpe?g|png)(\?|$)/i)?.[1] || 'jpg').toLowerCase().replace('jpeg', 'jpg');
    const rel = `assets/products/${im.product_id}-${im.pos}.${ext}`;
    for (let attempt = 0, wait = 10; attempt < 6; attempt++, wait *= 2) {
      try {
        const r = await fetch(im.remote_url, { headers: { 'User-Agent': 'Mozilla/5.0 StudioFuente-import' }, signal: AbortSignal.timeout(45000) });
        if (!r.ok || !(r.headers.get('content-type') || '').startsWith('image/')) throw new Error('status ' + r.status);
        writeFileSync(path.join(ROOT, 'public', rel), Buffer.from(await r.arrayBuffer()));
        run('UPDATE product_images SET local_path = ? WHERE id = ?', rel, im.id); ok++;
        break;
      } catch (e) { await new Promise(r => setTimeout(r, wait * 1000)); }
    }
    if (ok % 50 === 0) console.log(`${ok} opgeslagen`);
    await new Promise(r => setTimeout(r, 700));
  }
  console.log(`Klaar: ${ok} foto's opgeslagen.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importAll();
  (process.argv.includes('--afbeeldingen') ? downloadImages() : Promise.resolve()).then(() => db.close());
}

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = process.env.APP_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(path.join(ROOT, 'data'), { recursive: true });

export const db = new DatabaseSync(process.env.DB_PATH || path.join(ROOT, 'data', 'studiofuente.db'));
db.exec(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;`);

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id INTEGER,
  sort INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,          -- in centen, incl. btw
  regular_price INTEGER,
  unit TEXT DEFAULT 'st',
  sku TEXT DEFAULT '',
  description TEXT DEFAULT '',
  specs TEXT DEFAULT '[]',                   -- JSON [[label, waarde], ...]
  stock_status TEXT DEFAULT 'instock',
  visible INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  source_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS product_categories (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  pos INTEGER DEFAULT 0,
  remote_url TEXT NOT NULL,
  local_path TEXT,
  UNIQUE (product_id, pos)
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'klant',        -- klant | beheerder
  first_name TEXT DEFAULT '', last_name TEXT DEFAULT '',
  phone TEXT DEFAULT '', company TEXT DEFAULT '',
  street TEXT DEFAULT '', postcode TEXT DEFAULT '', city TEXT DEFAULT '', country TEXT DEFAULT 'NL',
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cart_items (
  session_id TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL,
  PRIMARY KEY (session_id, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'wacht_op_betaling',
  payment_status TEXT NOT NULL DEFAULT 'open',
  payment_ref TEXT,
  delivery TEXT NOT NULL DEFAULT 'bezorgen',  -- bezorgen | ophalen
  email TEXT NOT NULL, first_name TEXT, last_name TEXT, phone TEXT, company TEXT,
  street TEXT, postcode TEXT, city TEXT, country TEXT,
  note TEXT DEFAULT '',
  subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER, name TEXT NOT NULL, unit TEXT, price INTEGER NOT NULL, qty INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  text TEXT NOT NULL, by_user INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, topic TEXT, preferred TEXT, message TEXT,
  status TEXT DEFAULT 'nieuw',
  user_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, html TEXT NOT NULL, updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(visible, name);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pc_cat ON product_categories(category_id);
`);

db.exec(`CREATE TABLE IF NOT EXISTS guest_orders (session_id TEXT NOT NULL, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, PRIMARY KEY (session_id, order_id))`);
// Kleine migraties
const cols = t => db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
if (!cols('appointments').includes('kind')) db.exec(`ALTER TABLE appointments ADD COLUMN kind TEXT NOT NULL DEFAULT 'afspraak'`);

export const one = (sql, ...a) => db.prepare(sql).get(...a);
export const all = (sql, ...a) => db.prepare(sql).all(...a);
export const run = (sql, ...a) => db.prepare(sql).run(...a);
export function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

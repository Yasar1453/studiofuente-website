// Kijkversie op Netlify: de hele Express-app als één functie.
// De database is een kopie (data/kijkversie.db) die naar /tmp gaat. Wat bezoekers invullen wordt dus niet bewaard.
const { copyFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const serverless = require('serverless-http');

const ROOT = process.env.LAMBDA_TASK_ROOT || process.cwd();
const DB = '/tmp/studiofuente.db';
if (!existsSync(DB)) copyFileSync(path.join(ROOT, 'data', 'kijkversie.db'), DB);
process.env.APP_ROOT = ROOT;
process.env.DB_PATH = DB;
process.env.KIJKVERSIE = '1';
process.env.NODE_ENV = 'production';

let run;
const start = () => run ??= import('../../server/index.js').then(m => serverless(m.app));

exports.handler = async (event, context) => {
  if (event.path === '/robots.txt') return { statusCode: 200, headers: { 'Content-Type': 'text/plain' }, body: 'User-agent: *\nDisallow: /\n' };
  const res = await (await start())(event, context);
  res.headers = { ...res.headers, 'X-Robots-Tag': 'noindex, nofollow' };
  return res;
};

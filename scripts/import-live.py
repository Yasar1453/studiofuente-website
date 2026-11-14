"""Haalt alle producten, categorieen en juridische pagina's rustig op van studiofuente.nl.
Gebruik: python3 -I scripts/import-live.py   (hervat waar hij gebleven was)"""
import json, os, time, urllib.request, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')
BASE = 'https://studiofuente.nl'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh) StudioFuente-import'}

def get(url, tries=40):
    wait = 20
    for i in range(tries):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)
            return r.read(), dict(r.headers)
        except Exception as e:
            print(f'  wacht {wait}s ({e})', flush=True); time.sleep(wait); wait = min(wait * 2, 300)
    raise SystemExit('opgegeven: ' + url)

def save(name, data):
    with open(os.path.join(RAW, name), 'wb') as f: f.write(data)

if not os.path.exists(os.path.join(RAW, 'categories.json')):
    d, _ = get(BASE + '/wp-json/wc/store/v1/products/categories?per_page=100'); save('categories.json', d)
page = 1
while True:
    fn = f'products-{page:03d}.json'
    p = os.path.join(RAW, fn)
    if not os.path.exists(p):
        d, h = get(f'{BASE}/wp-json/wc/store/v1/products?per_page=100&page={page}&orderby=id&order=asc')
        arr = json.loads(d)
        if not arr: break
        save(fn, d); print(fn, len(arr), 'van', h.get('X-WP-Total') or h.get('x-wp-total'), flush=True)
        time.sleep(6)
    elif not json.load(open(p)): break
    if len(json.load(open(p))) < 100: break
    page += 1
for slug in ['algemene-voorwaarden', 'privacy-policy']:
    fn = f'page-{slug}.json'
    if not os.path.exists(os.path.join(RAW, fn)):
        d, _ = get(f'{BASE}/wp-json/wp/v2/pages?slug={slug}&_fields=title,content,modified'); save(fn, d); time.sleep(4)
print('KLAAR', flush=True)

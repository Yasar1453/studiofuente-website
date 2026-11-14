"""Maakt kleine webp-versies (640 px) van productfoto's voor de overzichten.
Gebruik: python3 -I scripts/thumbs.py   (slaat bestaande over)"""
import os, glob
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'assets', 'products')
DST = os.path.join(SRC, 't')
os.makedirs(DST, exist_ok=True)
def one(f):
    name = os.path.splitext(os.path.basename(f))[0] + '.webp'
    out = os.path.join(DST, name)
    if os.path.exists(out): return 0
    try:
        im = Image.open(f); im = im.convert('RGB')
        im.thumbnail((640, 800), Image.LANCZOS)
        im.save(out, 'WEBP', quality=78, method=5)
        return 1
    except Exception as e:
        print('fout', f, e); return 0
files = [f for f in glob.glob(os.path.join(SRC, '*.*')) if os.path.isfile(f)]
with ThreadPoolExecutor(8) as ex: n = sum(ex.map(one, files))
print(f'{n} nieuwe miniaturen, totaal {len(os.listdir(DST))}')

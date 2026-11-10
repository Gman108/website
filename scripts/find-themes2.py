#!/usr/bin/env python3
"""Follow-up: inspect specific archive.org items + targeted searches for the
remaining / imperfect theme songs."""
import json
import time
import urllib.parse
import urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) nostalgia-tv-builder/1.0'}


def get_json(url, timeout=30, retries=2):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode('utf-8', 'replace'))
        except Exception as e:
            if attempt == retries:
                raise
            time.sleep(2)


def probe(url):
    try:
        req = urllib.request.Request(url, headers={**UA, 'Range': 'bytes=0-1023'})
        with urllib.request.urlopen(req, timeout=30) as r:
            ct = (r.headers.get('Content-Type') or '').split(';')[0]
            cr = r.headers.get('Content-Range') or ''
            size = int(cr.rsplit('/', 1)[1]) if '/' in cr else 0
            head = r.read(4)
            return {'ok': r.status in (200, 206), 'ct': ct, 'size': size, 'id3': head[:3] == b'ID3'}
    except Exception as e:
        return {'ok': False, 'err': str(e)[:120]}


def inspect(identifier, kws, label):
    """List mp3 files in an item matching keywords, with probes."""
    print(f'\n--- {label} [{identifier}] ---', flush=True)
    try:
        meta = get_json(f'https://archive.org/metadata/{identifier}')
    except Exception as e:
        print(f'  meta fail: {str(e)[:80]}')
        return []
    out = []
    for f in meta.get('files', []) or []:
        name = f.get('name') or ''
        if not name.lower().endswith('.mp3'):
            continue
        hay = (name + ' ' + (f.get('title') or '')).lower()
        if kws and not any(k in hay for k in kws):
            continue
        url = f'https://archive.org/download/{identifier}/{urllib.parse.quote(name)}'
        p = probe(url)
        print(f"  {name[:70]!r} {p.get('size',0)//1024}KB {p.get('ct','')} "
              f"{'ERR' if not p.get('ok') else ''}", flush=True)
        if p.get('ok') and p.get('size', 0) > 500_000:
            out.append({'url': url, 'file': name, 'size': p['size'], 'ident': identifier})
    return out


def search(query, rows=20):
    q = urllib.parse.quote(f'({query}) AND mediatype:(audio)')
    res = get_json(
        f'https://archive.org/advancedsearch.php?q={q}'
        f'&fl%5B%5D=identifier&fl%5B%5D=title&rows={rows}&output=json')
    docs = res.get('response', {}).get('docs', [])
    print(f'\n=== search "{query}" -> {len(docs)}', flush=True)
    for d in docs:
        print(f"  {d['identifier']}  |  {d.get('title','')[:60]}", flush=True)
    return docs


found = {}

# 1) Naruto — item found earlier; inspect its files
found.setdefault('naruto', inspect(
    'naruto-opening-4-full-flow-go_20210921', ['go', 'fighting', 'dream', 'flow'], 'naruto GO!!!'))
if not found.get('naruto'):
    for q in ['naruto opening 4 go flow', '"GO!!!" naruto', 'naruto best hits flow']:
        docs = search(q)
        time.sleep(1)

# 2) Spirited Away — inspect the OST item found earlier
found.setdefault('spirited-away', inspect(
    'always-with-me-spirited-away-ost-soundtrack',
    ["one summer", 'always with me', 'itsumo', 'name of life', 'inochi'], 'spirited away'))

# 3) Cowboy Bebop — original Tank! from the CD box OST
found.setdefault('cowboy-bebop', inspect(
    'cowboy-bebop-cd-box-ost', ['tank'], 'bebop CD box'))

# 4) DBZ — Japanese original via tvtunes
docs = search('tvtunes dragon ball')
time.sleep(1)

# 5) Pokemon — anime theme via tvtunes
docs = search('tvtunes pokemon')
time.sleep(1)

# 6) Clannad — original (not cover)
docs = search('clannad original soundtrack dango')
time.sleep(1)

# 7) AIR — original vocal Tori no Uta
docs = search('air original soundtrack tori')
time.sleep(1)

print('\n==== follow-up picks ====')
print(json.dumps(found, indent=2))
with open('/tmp/anime-imgs/themes-followup.json', 'w') as fp:
    json.dump(found, fp, indent=2)

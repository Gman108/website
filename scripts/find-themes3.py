#!/usr/bin/env python3
"""Round 3: targeted inspection for naruto / clannad / air / dbz / pokemon."""
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
        except Exception:
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


def inspect(identifier, kws=None, label='', show_all=False):
    print(f'\n--- {label} [{identifier}] ---', flush=True)
    try:
        meta = get_json(f'https://archive.org/metadata/{identifier}')
    except Exception as e:
        print(f'  meta fail: {str(e)[:80]}')
        return []
    out = []
    files = [f for f in (meta.get('files') or [])
             if (f.get('name') or '').lower().endswith(('.mp3', '.m4a', '.ogg'))]
    for f in files:
        name = f.get('name') or ''
        hay = (name + ' ' + (f.get('title') or '')).lower()
        matched = not kws or any(k in hay for k in kws)
        if not matched and not show_all:
            continue
        url = f'https://archive.org/download/{identifier}/{urllib.parse.quote(name)}'
        p = probe(url) if matched else None
        mark = ''
        if p:
            mark = f"{p.get('size',0)//1024}KB {p.get('ct','')} {'ERR' if not p.get('ok') else ''}"
        print(f"  {name[:75]!r} {mark}", flush=True)
        if p and p.get('ok') and p.get('size', 0) > 500_000:
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
        print(f"  {d['identifier']}  |  {d.get('title','')[:65]}", flush=True)
    return docs


picks = {}

# 1) Naruto — full file list of the GO!!! item
picks['naruto'] = inspect('naruto-opening-4-full-flow-go_20210921',
                          kws=None, label='naruto item files', show_all=True)
if not picks['naruto']:
    for q in ['naruto opening flow go', 'flow go anime']:
        search(q)
        time.sleep(1)

# 2) AIR — original Tori no Uta single
picks['air'] = inspect('air-analogue-collectors-edition-tori-no-uta-ksla-0022-vn',
                       kws=['tori'], label='AIR Tori no Uta KSLA-0022')
if not picks['air']:
    picks['air'] = inspect('tori_no_uta', kws=['tori', 'bird'],
                           label='tori_no_uta Bird Poem')

# 3) Clannad — hunt the original OST
for q in ['clannad soundtrack', 'clannad ost', 'key clannad ksla']:
    docs = search(q)
    for d in docs[:3]:
        r = inspect(d['identifier'], kws=['dango'], label='clannad candidate')
        if r:
            picks['clannad'] = r
            break
    if picks.get('clannad'):
        break
    time.sleep(1)

# 4) DBZ — Japanese Cha-La or US Rock the Dragon
search('tvtunes dragon ball z theme')
time.sleep(1)
picks['dbz-jp'] = inspect('DBZ-German-based-OP-1', kws=['japan', 'orig'],
                          label='DBZ item alternates')

# 5) Pokemon — English theme hunt
for q in ['tvtunes pokemon theme', '"pokemon theme" gotta catch jason', 'pokemon anime theme song english']:
    docs = search(q)
    time.sleep(1)

print('\n==== round3 picks ====')
print(json.dumps(picks, indent=2))
with open('/tmp/anime-imgs/themes-round3.json', 'w') as fp:
    json.dump(picks, fp, indent=2)

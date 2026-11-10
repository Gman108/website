#!/usr/bin/env python3
"""Round 7: Naruto GO!!! — FLOW best albums + backup OP1."""
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
            return {'ok': r.status in (200, 206), 'ct': ct, 'size': size}
    except Exception as e:
        return {'ok': False, 'err': str(e)[:120]}


def inspect(identifier, kws=None, label='', max_show=25):
    print(f'\n--- {label} [{identifier}] ---', flush=True)
    try:
        meta = get_json(f'https://archive.org/metadata/{identifier}')
    except Exception as e:
        print(f'  meta fail: {str(e)[:80]}')
        return []
    out = []
    shown = 0
    for f in meta.get('files') or []:
        name = f.get('name') or ''
        if not name.lower().endswith(('.mp3', '.m4a', '.ogg')):
            continue
        hay = (name + ' ' + (f.get('title') or '')).lower()
        if kws and not any(k in hay for k in kws):
            continue
        url = f'https://archive.org/download/{identifier}/{urllib.parse.quote(name)}'
        p = probe(url)
        if shown < max_show:
            print(f"  {name[:75]!r} {p.get('size',0)//1024}KB {p.get('ct','')} "
                  f"{'ERR:'+str(p.get('err',''))[:40] if not p.get('ok') else ''}", flush=True)
            shown += 1
        if p.get('ok') and 400_000 < p.get('size', 0) < 45_000_000:
            out.append({'url': url, 'file': name, 'size': p['size'], 'ident': identifier})
    return out


def search(query, rows=25):
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

# FLOW best albums
for q in ['flow anime best', 'flow the best', 'flow go!!! 2004', 'flow single collection']:
    docs = search(q)
    for d in docs:
        blob = (d['identifier'] + ' ' + d.get('title', '')).lower()
        if 'flow' not in blob:
            continue
        r = inspect(d['identifier'], kws=['go!!!', 'go !!!', 'fighting dreamers'],
                    label='flow candidate')
        if r:
            picks['naruto'] = r
            break
        time.sleep(0.8)
    if picks.get('naruto'):
        break
    time.sleep(1)

# backup: Naruto OP1
if not picks.get('naruto'):
    picks['naruto'] = inspect('tvtunes_7129', kws=None, label='naruto OP1 tvtunes')

print('\n==== round7 picks ====')
print(json.dumps(picks, indent=2))
with open('/tmp/anime-imgs/themes-round7.json', 'w') as fp:
    json.dump(picks, fp, indent=2)

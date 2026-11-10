#!/usr/bin/env python3
"""Round 4: final hunts — naruto, clannad original, dbz cha-la, pokemon english."""
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


def inspect(identifier, kws=None, label='', audio_only=True):
    print(f'\n--- {label} [{identifier}] ---', flush=True)
    try:
        meta = get_json(f'https://archive.org/metadata/{identifier}')
    except Exception as e:
        print(f'  meta fail: {str(e)[:80]}')
        return []
    out = []
    exts = ('.mp3', '.m4a', '.ogg', '.wav', '.flac') if audio_only else ()
    for f in meta.get('files') or []:
        name = f.get('name') or ''
        if audio_only and not name.lower().endswith(exts):
            continue
        hay = (name + ' ' + (f.get('title') or '')).lower()
        if kws and not any(k in hay for k in kws):
            continue
        url = f'https://archive.org/download/{identifier}/{urllib.parse.quote(name)}'
        p = probe(url)
        print(f"  {name[:75]!r} {p.get('size',0)//1024}KB {p.get('ct','')} "
              f"{'ERR:'+str(p.get('err',''))[:40] if not p.get('ok') else ''}", flush=True)
        if p.get('ok') and 400_000 < p.get('size', 0) < 40_000_000 and name.lower().endswith(('.mp3', '.m4a', '.ogg')):
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

# 1) Naruto — any file in that item + extra searches
print('\n########## NARUTO', flush=True)
inspect('naruto-opening-4-full-flow-go_20210921', kws=None,
        label='naruto ALL files', audio_only=False)
for q in ['"GO!!!" flow naruto', 'flow go naruto opening', 'naruto opening 4']:
    search(q)
    time.sleep(1)

# 2) Clannad — the real OST CDs
print('\n########## CLANNAD', flush=True)
for ident in ['ClannadOriginalSoundtrackCD3', 'ClannadOriginalSoundtrackCD2',
              'clannad-original-soundtrack', 'clannad-lossless',
              'ClannadOriginalSountrackCD1']:
    r = inspect(ident, kws=['dango', 'daikazoku'], label='clannad OST')
    if r:
        picks['clannad'] = r
        break
    time.sleep(0.8)

# 3) DBZ — cha-la hunt
print('\n########## DBZ', flush=True)
for ident in ['tvtunes_10448', 'tvtunes_3601', 'tvtunes_5529']:
    r = inspect(ident, kws=None, label='dbz tvtunes')
    if r:
        picks.setdefault('dbz', []).extend(r)
    time.sleep(0.8)
search('"cha la head cha la"')
time.sleep(1)

# 4) Pokemon — English theme collections
print('\n########## POKEMON', flush=True)
for ident in ['pokemon-theme-song-collection', 'pokemon-english-theme-song-collection-vol-2']:
    r = inspect(ident, kws=['theme', 'gotta', 'pokemon'], label='pokemon english')
    if r:
        picks.setdefault('pokemon', []).extend(r[:3])
    time.sleep(0.8)

print('\n==== round4 picks ====')
print(json.dumps(picks, indent=2))
with open('/tmp/anime-imgs/themes-round4.json', 'w') as fp:
    json.dump(picks, fp, indent=2)

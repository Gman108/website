#!/usr/bin/env python3
"""Round 5: final three — naruto openings collection, dbz kageyama, clannad cds."""
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


def inspect(identifier, kws=None, label='', max_show=60):
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
        if not name.lower().endswith(('.mp3', '.m4a', '.ogg', '.flac', '.wav')):
            continue
        hay = (name + ' ' + (f.get('title') or '')).lower()
        matched = not kws or any(k in hay for k in kws)
        if kws and not matched:
            continue
        url = f'https://archive.org/download/{identifier}/{urllib.parse.quote(name)}'
        p = probe(url)
        if shown < max_show:
            print(f"  {name[:75]!r} {p.get('size',0)//1024}KB {p.get('ct','')} "
                  f"{'ERR:'+str(p.get('err',''))[:40] if not p.get('ok') else ''}", flush=True)
            shown += 1
        if p.get('ok') and 400_000 < p.get('size', 0) < 45_000_000 \
                and name.lower().endswith(('.mp3', '.m4a', '.ogg')):
            out.append({'url': url, 'file': name, 'size': p['size'], 'ident': identifier})
    return out


picks = {}

# 1) Naruto — openings 1-20 collection
picks['naruto'] = inspect('OST_Anime_Naruto_Kecil_bag_Opening1-20',
                          kws=['go', '4', 'flow'], label='naruto openings 1-20')
if not picks['naruto']:
    picks['naruto'] = inspect('OST_Anime_Naruto_Kecil_bag_Opening1-20',
                              kws=None, label='naruto openings ALL')

# 2) DBZ — Kageyama zenkai album + Koro-chan DBZ Best
r = inspect('02.-zenkai', kws=['cha'], label='kageyama zenkai album')
if r:
    picks['dbz'] = r
else:
    r2 = inspect('koro-chan-dbz-best-wav-hi-res', kws=['cha', 'chala'],
                 label='koro-chan dbz best')
    if r2:
        picks['dbz'] = r2

# 3) Clannad — full listing of the OST items
for ident in ['ClannadOriginalSoundtrackCD3', 'clannad-original-soundtrack',
              'clannad-lossless', 'ClannadOriginalSoundtrackCD2']:
    r = inspect(ident, kws=['dango', 'daikazoku', 'ending', 'ed'], label='clannad cds')
    if r:
        picks['clannad'] = r
        break
    # if nothing matched, dump plain file names once for CD3
if not picks.get('clannad'):
    inspect('ClannadOriginalSoundtrackCD3', kws=None, label='CD3 all files', max_show=40)

print('\n==== round5 picks ====')
print(json.dumps(picks, indent=2))
with open('/tmp/anime-imgs/themes-round5.json', 'w') as fp:
    json.dump(picks, fp, indent=2)

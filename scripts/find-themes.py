#!/usr/bin/env python3
"""Find the #1 theme song of each anime on archive.org and test direct MP3 URLs."""
import json
import time
import urllib.parse
import urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) nostalgia-tv-builder/1.0'}

# (slug, search queries to try in order, file-name keywords, item-title keywords)
SONGS = [
    ('clannad', ['"Dango Daikazoku"', 'clannad soundtrack'], ['dango'], ['clannad']),
    ('kanon', ['"Last Regrets"', 'kanon soundtrack'], ['last regrets', 'regret'], ['kanon']),
    ('air', ['"Tori no Uta"', 'air soundtrack lia'], ['tori no uta', 'tori'], ['air', 'kanon', 'key']),
    ('evangelion', ['"Zankoku na Tenshi no Teeze"', 'cruel angels thesis evangelion'],
     ['zankoku', 'cruel angel', 'teeze', 'tenshi', 'these'], ['evangelion', 'eva']),
    ('sailor-moon', ['"Moonlight Densetsu"', 'sailor moon soundtrack'],
     ['moonlight densetsu', 'moonlight'], ['sailor']),
    ('dragon-ball-z', ['"Cha-La Head-Cha-La"', 'dragon ball z kageyama'],
     ['cha-la', 'chala', 'cha la'], ['dragon']),
    ('pokemon', ['pokemon theme gotta catch', 'pokemon tv theme song', 'pokemon soundtrack'],
     ['gotta catch', 'pokemon theme', 'pokémon theme', 'main theme', 'theme'], ['pokemon', 'pokémon']),
    ('cardcaptor-sakura', ['"Catch You Catch Me"', 'cardcaptor sakura ost'],
     ['catch you catch me', 'catch you'], ['sakura', 'cardcaptor', 'ccs']),
    ('spirited-away', ['"One Summers Day" hisaishi', 'spirited away soundtrack'],
     ["one summer's day", 'one summers day', 'one summer'], ['spirited', 'chihiro']),
    ('cowboy-bebop', ['"Tank!" seatbelts', 'cowboy bebop soundtrack'], ['tank'], ['bebop']),
    ('naruto', ['"Fighting Dreamers"', 'naruto opening flow', 'naruto ost'],
     ['go!!!', 'fighting dreamers', 'go !!!'], ['naruto']),
]


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
    return None


def probe(url):
    """HEAD-ish probe via range request; returns dict with ok/size/content-type."""
    try:
        req = urllib.request.Request(
            url, headers={**UA, 'Range': 'bytes=0-1023'})
        with urllib.request.urlopen(req, timeout=30) as r:
            ct = r.headers.get('Content-Type') or ''
            cr = r.headers.get('Content-Range') or ''
            size = 0
            if '/' in cr:
                try:
                    size = int(cr.rsplit('/', 1)[1])
                except ValueError:
                    pass
            head = r.read(4)
            return {
                'ok': r.status in (200, 206),
                'ct': ct.split(';')[0],
                'size': size,
                'id3': head[:3] == b'ID3',
            }
    except Exception as e:
        return {'ok': False, 'err': str(e)[:120]}


RESULTS = {}

for slug, queries, filekws, itemkws in SONGS:
    print(f'\n{"="*60}\n{slug}', flush=True)
    picked = False
    for query in queries:
        if picked:
            break
        q = urllib.parse.quote(f'({query}) AND mediatype:(audio)')
        try:
            res = get_json(
                f'https://archive.org/advancedsearch.php?q={q}'
                f'&fl%5B%5D=identifier&fl%5B%5D=title&rows=15&output=json')
        except Exception as e:
            print(f'  search failed for "{query}": {str(e)[:80]}')
            continue
        docs = res.get('response', {}).get('docs', [])
        # keep items whose title/identifier mentions the show
        relevant = []
        for d in docs:
            blob = f"{d.get('identifier','')} {d.get('title','')}".lower()
            if any(k in blob for k in itemkws):
                relevant.append(d)
        print(f'  query "{query}": {len(docs)} hits, {len(relevant)} relevant: '
              + '; '.join(d['identifier'] for d in relevant[:6]), flush=True)

        candidates = []
        for d in relevant[:6]:
            ident = d['identifier']
            try:
                meta = get_json(f'https://archive.org/metadata/{ident}')
            except Exception as e:
                print(f'  [meta fail {ident}] {str(e)[:60]}')
                continue
            for f in meta.get('files', []) or []:
                name = f.get('name') or ''
                if not name.lower().endswith('.mp3'):
                    continue
                hay = (name + ' ' + (f.get('title') or '')).lower()
                score = sum(1 for k in filekws if k in hay)
                if score == 0:
                    continue
                url = (f'https://archive.org/download/{ident}/'
                       + urllib.parse.quote(name))
                candidates.append(
                    {'score': score, 'ident': ident, 'file': name, 'url': url})
            time.sleep(0.5)

        candidates.sort(key=lambda c: -c['score'])
        for c in candidates[:6]:
            p = probe(c['url'])
            size_kb = p.get('size', 0) // 1024
            print(f"    [{c['score']}] {c['file'][:60]!r} -> {size_kb}KB "
                  f"{p.get('ct','')}{' ID3' if p.get('id3') else ''} "
                  f"{'ERR:'+str(p.get('err','')) if not p.get('ok') else ''}", flush=True)
            if p.get('ok') and p.get('size', 0) > 600_000 and p.get('size', 0) < 40_000_000:
                RESULTS[slug] = {
                    'url': c['url'], 'file': c['file'],
                    'size': p['size'], 'ident': c['ident']}
                print(f'  ==> PICKED {slug}: {c["file"]}', flush=True)
                picked = True
                break
        time.sleep(0.8)
    if not picked:
        print(f'  !!! NOT FOUND for {slug}', flush=True)

print('\n\n==== FINAL PICKS ====')
print(json.dumps(RESULTS, indent=2))
with open('/tmp/anime-imgs/themes.json', 'w') as fp:
    json.dump(RESULTS, fp, indent=2)
print(f'\n{len(RESULTS)}/11 songs found')

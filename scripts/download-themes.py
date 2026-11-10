#!/usr/bin/env python3
"""Download the final theme song picks to public/audio/{slug}.mp3."""
import os
import time
import urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) nostalgia-tv-builder/1.0'}

TRACKS = {
    'clannad': (
        'Dango Daikazoku (A Big Dango Family)',
        'https://archive.org/download/key-box-for-two-decades-ksla-1001/'
        '10-02%20-%20A%20Big%20Dango%20Family.mp3'),
    'kanon': (
        'Last Regrets',
        'https://archive.org/download/kanongame.original.soundtrack.ape/'
        'Last%20regrets%20%28Full%20Chorus%20Version%29.mp3'),
    'air': (
        'Tori no Uta',
        'https://archive.org/download/tori_no_uta/Tori%20No%20Uta.mp3'),
    'evangelion': (
        'Zankoku na Tenshi no These',
        'https://archive.org/download/neon-genesis-evangelion-ost-collection-flac/'
        'Singles/2003%20-%20Zankoku%20na%20Tenshi%20no%20These%20%26%20Fly%20Me%20'
        'to%20the%20Moon/01%20-%20Zankoku%20na%20Tenshi%20no%20These.mp3'),
    'sailor-moon': (
        'Moonlight Densetsu (TV size)',
        'https://archive.org/download/tvtunes_15892/'
        'Sailor%20Moon%20Super%20S%20-%20Movie%20-%20Moonlight%20Densetsu%20-%20TV%20size.mp3'),
    'dragon-ball-z': (
        'Cha-La Head-Cha-La',
        'https://archive.org/download/02.-zenkai/01.%20Cha-La%20Head-Cha-La.mp3'),
    'pokemon': (
        "Pokemon Theme (Gotta Catch 'Em All)",
        'https://archive.org/download/pokemon-theme-song-collection/'
        'Poke%CC%81mon%20English%20Theme%20Song%20Collection/01%20-%20Poke%CC%81mon%20Theme.mp3'),
    'cardcaptor-sakura': (
        'Catch You Catch Me',
        'https://archive.org/download/tvtunes_14631/'
        'Cardcaptor%20Sakura%20-%20Catch%20You%20Catch%20Me%20-%20Season%201%20Intro%20-%20Long.mp3'),
    'spirited-away': (
        'Always With Me (Itsumo Nando Demo)',
        'https://archive.org/download/always-with-me-spirited-away-ost-soundtrack/'
        'Always%20with%20me%20-%20Spirited%20Away%20OST%20Soundtrack.mp3'),
    'cowboy-bebop': (
        'Tank! [TV Edit]',
        'https://archive.org/download/cowboy-bebop-cd-box-ost/Disc%2001/'
        '02%20Seatbelts%20-%20Cowboy%20Bebop%20CD-BOX%20Original%20Soundtrack%20-%20'
        'Disc%2001%20-%20Tank%21%20%5BTV%20Edit%5D.mp3'),
    'naruto': (
        'Rocks (Opening 1)',
        'https://archive.org/download/tvtunes_7129/Naruto%20-%20Opening%20%201.mp3'),
}


def download(url, dest):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, 'wb') as f:
        total = 0
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
    return total


os.makedirs('public/audio', exist_ok=True)
ok = 0
for slug, (name, url) in TRACKS.items():
    dest = f'public/audio/{slug}.mp3'
    if os.path.exists(dest) and os.path.getsize(dest) > 400_000:
        print(f'{slug}: exists ({os.path.getsize(dest)//1024}KB)', flush=True)
        ok += 1
        continue
    for attempt in range(3):
        try:
            size = download(url, dest)
            print(f'{slug}: {size//1024}KB  ({name})', flush=True)
            if size > 400_000:
                ok += 1
                break
        except Exception as e:
            print(f'{slug}: attempt {attempt+1} failed: {str(e)[:80]}', flush=True)
            time.sleep(3)
    time.sleep(1)

print(f'\n{ok}/11 downloaded')

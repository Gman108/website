import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const animeData = [
  {
    slug: 'clannad',
    title: 'Clannad',
    titleJp: 'CLANNAD -クラナド-',
    year: 2007,
    studio: 'Kyoto Animation',
    genre: 'Drama / Romance / Slice of Life',
    episodes: '23 + After Story (24)',
    synopsis:
      'Tomoya Okazaki, a delinquent who has lost all hope in life, meets Nagisa Furukawa — a soft-spoken girl repeating her senior year. Together with the drama club, they piece together friendships, family, and the meaning of a town full of warm memories. After Story then follows them into adulthood, marriage, and the hardest winter of their lives.',
    tagline: 'The dango family song you never stopped humming',
    quote: 'Big Dango Family~ 🍡',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f77fa2b647fd.jpg',
    nostalgia: 9.8,
    themeName: 'Dango Daikazoku (A Big Dango Family)',
    themeArtist: 'Chata',
    audioUrl: '/audio/clannad.mp3',
  },
  {
    slug: 'kanon',
    title: 'Kanon',
    titleJp: 'Kanon -カノン-',
    year: 2006,
    studio: 'Kyoto Animation',
    genre: 'Drama / Romance / Supernatural',
    episodes: '24',
    synopsis:
      'Yuuichi Aizawa returns to a snow-covered northern town he barely remembers from childhood winters. As the snow piles up, forgotten promises resurface — a girl named Ayu, taiyaki theft, and miracles that cost everything. The second of Key\'s "crying game" trilogy that defined 2000s tearjerker anime.',
    tagline: 'Where the snow never stops falling',
    quote: 'Uguu~',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e65938f235d8.jpg',
    nostalgia: 9.4,
    themeName: 'Last Regrets',
    themeArtist: 'Ayana',
    audioUrl: '/audio/kanon.mp3',
  },
  {
    slug: 'air',
    title: 'AIR',
    titleJp: 'AIR',
    year: 2005,
    studio: 'Kyoto Animation',
    genre: 'Drama / Romance / Supernatural',
    episodes: '12 + Summer Specials',
    synopsis:
      'A wandering puppeteer arrives in a seaside town during a blazing summer and meets Misuzu — a lonely girl who laughs like a dinosaur when something is too funny to bear. A thousand-year-old curse, a girl who dreams of flying in an empty sky, and the summer that started the Key trilogy.',
    tagline: 'The summer that started it all',
    quote: 'Gao~',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f30523b9a2a9.jpg',
    nostalgia: 9.1,
    themeName: 'Tori no Uta',
    themeArtist: 'Lia',
    audioUrl: '/audio/air.mp3',
  },
  {
    slug: 'evangelion',
    title: 'Neon Genesis Evangelion',
    titleJp: '新世紀エヴァンゲリオン',
    year: 1995,
    studio: 'Gainax / Tatsunoko',
    genre: 'Mecha / Psychological / Drama',
    episodes: '26 + End of Eva',
    synopsis:
      'Shinji Ikari is summoned to Tokyo-3 by the father who abandoned him, and thrust into the cockpit of Evangelion Unit-01 to fight creatures called Angels. What begins as a mecha show becomes a descent into depression, identity, and the hearts of characters who defined a generation of anime fans.',
    tagline: 'Congratulations, you understood nothing',
    quote: 'Get in the robot, Shinji.',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/078e147782f7.jpg',
    nostalgia: 9.9,
    themeName: 'Zankoku na Tenshi no These (A Cruel Angel\'s Thesis)',
    themeArtist: 'Yoko Takahashi',
    audioUrl: '/audio/evangelion.mp3',
  },
  {
    slug: 'sailor-moon',
    title: 'Sailor Moon',
    titleJp: '美少女戦士セーラームーン',
    year: 1992,
    studio: 'Toei Animation',
    genre: 'Magical Girl / Romance / Action',
    episodes: '200 (5 seasons)',
    synopsis:
      'Usagi Tsukino, a clumsy crybaby middle schooler, rescues a talking cat named Luna and awakens as Sailor Moon — guardian of love and justice. With the Sailor Senshi at her side she fights the Negaverse, falls in love across lifetimes, and defined the magical girl genre forever.',
    tagline: 'Fighting evil by moonlight, winning love by daylight',
    quote: 'In the name of the Moon, I\'ll punish you!',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/128ba37e7789.jpg',
    nostalgia: 9.7,
    themeName: 'Moonlight Densetsu',
    themeArtist: 'DALI',
    audioUrl: '/audio/sailor-moon.mp3',
  },
  {
    slug: 'dragon-ball-z',
    title: 'Dragon Ball Z',
    titleJp: 'ドラゴンボールZ',
    year: 1989,
    studio: 'Toei Animation',
    genre: 'Shonen / Action / Adventure',
    episodes: '291',
    synopsis:
      'Goku, now an adult with a family, discovers he is a Saiyan warrior sent to destroy Earth — and defends it instead against Frieza, Cell, and Majin Buu. Power-ups screamed at the top of your lungs, episodes of powering up, and the reason every kid in the 90s tried to go Super Saiyan.',
    tagline: 'Over 9000 hours of childhood',
    quote: 'It\'s over 9000!',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/be0c2195e314.jpg',
    nostalgia: 9.9,
    themeName: 'Cha-La Head-Cha-La',
    themeArtist: 'Hironobu Kageyama',
    audioUrl: '/audio/dragon-ball-z.mp3',
  },
  {
    slug: 'pokemon',
    title: 'Pokémon',
    titleJp: 'ポケットモンスター',
    year: 1997,
    studio: 'OLM',
    genre: 'Adventure / Comedy / Kids',
    episodes: '1200+ (and counting)',
    synopsis:
      'Ash Ketchum of Pallet Town sets off at age 10 with a stubborn Pikachu who refuses to enter a Poké Ball. From the Indigo League to Team Rocket blasting off again, the show that made every kid trade cards at lunchtime and memorize 151 creatures.',
    tagline: 'Gotta catch \'em all — one VHS tape at a time',
    quote: 'Pika pika!',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bfee46189ed7.jpg',
    nostalgia: 9.8,
    themeName: 'Pokémon Theme (Gotta Catch \'Em All)',
    themeArtist: 'Jason Paige',
    audioUrl: '/audio/pokemon.mp3',
  },
  {
    slug: 'cardcaptor-sakura',
    title: 'Cardcaptor Sakura',
    titleJp: 'カードキャプターさくら',
    year: 1998,
    studio: 'Madhouse',
    genre: 'Magical Girl / Adventure / Comedy',
    episodes: '70',
    synopsis:
      'Sakura Kinomoto accidentally unleashes the magical Clow Cards from a mysterious book in her father\'s study. Appointed Cardcaptor by the guardian beast Kero-chan, she captures spirits with wit, kindness, and a different outrageous outfit every episode designed by CLAMP.',
    tagline: 'Release! Every wand pose, memorized',
    quote: 'Hoeee~!',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f48cb506526a.jpg',
    nostalgia: 9.5,
    themeName: 'Catch You Catch Me',
    themeArtist: 'Gumi',
    audioUrl: '/audio/cardcaptor-sakura.mp3',
  },
  {
    slug: 'spirited-away',
    title: 'Spirited Away',
    titleJp: '千と千尋の神隠し',
    year: 2001,
    studio: 'Studio Ghibli',
    genre: 'Fantasy / Adventure / Coming of Age',
    episodes: 'Movie',
    synopsis:
      'Sullen 10-year-old Chihiro wanders into a spirit world where her parents are turned into pigs and her name is taken by the witch Yubaba. Working in a bathhouse for gods, she finds courage she never knew she had. The first anime film to win an Academy Award, and the VHS that wore out in a million family players.',
    tagline: 'The bathhouse that raised a generation',
    quote: 'Once you\'ve met someone, you never really forget them.',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f266097e2226.jpg',
    nostalgia: 9.9,
    themeName: 'Always With Me (Itsumo Nando Demo)',
    themeArtist: 'Youmi Kimura',
    audioUrl: '/audio/spirited-away.mp3',
  },
  {
    slug: 'cowboy-bebop',
    title: 'Cowboy Bebop',
    titleJp: 'カウボーイビバップ',
    year: 1998,
    studio: 'Sunrise',
    genre: 'Space Western / Jazz / Noir',
    episodes: '26 + Movie',
    synopsis:
      'In 2071, bounty hunter Spike Spiegel drifts through the solar system on the spaceship Bebop with Jet, Faye, Ed, and a data dog named Ein — chasing bounties, running from the past, and scoring it all to the coolest jazz soundtrack ever recorded for television. See you, space cowboy.',
    tagline: 'Whatever happens, happens',
    quote: 'Bang.',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/582bd160e016.jpg',
    nostalgia: 9.6,
    themeName: 'Tank! [TV Edit]',
    themeArtist: 'The Seatbelts',
    audioUrl: '/audio/cowboy-bebop.mp3',
  },
  {
    slug: 'naruto',
    title: 'Naruto',
    titleJp: 'NARUTO -ナルト-',
    year: 2002,
    studio: 'Studio Pierrot',
    genre: 'Shonen / Action / Adventure',
    episodes: '220',
    synopsis:
      'Naruto Uzumaki, an orphan shunned for the Nine-Tailed Fox sealed inside him, dreams of becoming Hokage so the whole village finally acknowledges him. Ninja way speeches, shadow clones, friendship attacks, and the anime that dominated every schoolyard argument of the 2000s.',
    tagline: 'Dattebayo! The era of headbands',
    quote: 'Believe it!',
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/93bca740e645.jpg',
    nostalgia: 9.5,
    themeName: 'Rocks (Opening 1)',
    themeArtist: 'Hound Dog',
    audioUrl: '/audio/naruto.mp3',
  },
]

const commentData = [
  {
    author: 'DangoLover99',
    message: 'I watched Clannad After Story at 2am on a school night in 2009 with headphones in so my parents wouldn\'t hear me sobbing. Still can\'t hear "Dango Daikazoku" at a supermarket without tearing up. This show rewired my brain.',
    mood: 'crying',
    animeSlug: 'clannad',
  },
  {
    author: 'MoonStickTTY',
    message: 'Every Saturday morning I set my alarm for 6:30 to watch Sailor Moon on VHS I\'d recorded the night before. My mom taped over one episode with a soap opera once and I genuinely cried. Transformation wands were a whole era. ✨',
    mood: 'sparkly',
    animeSlug: 'sailor-moon',
  },
  {
    author: 'over9000club',
    message: 'The entire classroom screaming "IT\'S OVER 9000!" in 2004 and the teacher having no idea why. That was peak comedy. Also we all bruised our palms doing the Kamehameha pose. Worth it.',
    mood: 'hyped',
    animeSlug: 'dragon-ball-z',
  },
  {
    author: 'ShinjiGetInTheRobot',
    message: 'Watched EVA dubbed on VHS at a friend\'s basement in 2003. We thought it was a robot show. By episode 24 none of us were okay. "Congratulations" is still the funniest, saddest ending in anime. Instrumentality is a metaphor for this website.',
    mood: 'existential',
    animeSlug: 'evangelion',
  },
  {
    author: 'sakura_card_fan',
    message: 'I made my own Clow Cards out of cardboard and made my little brother be Kero. The wand poses were PERFECTED. Watched it every day after school on a channel that didn\'t exist anymore two years later. Hoeee~ 🌸',
    mood: 'sparkly',
    animeSlug: 'cardcaptor-sakura',
  },
  {
    author: 'TrainUnderStars',
    message: 'The Bebop soundtrack made me pick up the saxophone. I\'m terrible at it. "See you space cowboy..." hits harder every year I get older. This is the anime that made adults take anime seriously in my house.',
    mood: 'jazzy',
    animeSlug: 'cowboy-bebop',
  },
  {
    author: 'TeamRocketBlastOff',
    message: 'Me and my cousin traded 200+ Pokémon cards on my grandma\'s porch. My holo Charizard got bent in my pocket. Still not over it. I can name all 151 original Pokémon in order and that knowledge will never leave my brain. Pika pika!',
    mood: 'nostalgic',
    animeSlug: 'pokemon',
  },
  {
    author: 'UguuWinter2006',
    message: 'Kanon in the snow, watching it during an actual snowstorm with hot cocoa and dial-up internet that kept buffering. 2006 was a simpler, colder, better winter. Uguu~',
    mood: 'cozy',
    animeSlug: 'kanon',
  },
  {
    author: 'HokageDreamer',
    message: 'I ran with my arms behind my back to school because Naruto did it. Got stopped by a teacher who asked if my arms were broken. Worth it believe it!',
    mood: 'hyped',
    animeSlug: 'naruto',
  },
  {
    author: 'GaoGaoSummer',
    message: 'AIR\'s ending broke me so bad I rewatched it every summer just to feel something. Misuzu\'s "Gao~" became my personality for a full year. Key trilogy supremacy. 🌾',
    mood: 'crying',
    animeSlug: 'air',
  },
  {
    author: 'TrainRideToNowhere',
    message: 'My family\'s Spirited Away VHS had a section where the tape wobbled and the audio pitched down. I thought it was part of the movie for YEARS. Watching the clean version as an adult felt like watching a different film. Chihiro gang forever.',
    mood: 'nostalgic',
    animeSlug: 'spirited-away',
  },
  {
    author: 'Webmaster_Kev',
    message: 'This whole site is giving me 2005 anime forum energy — the guestbook, the star GIFs, the MIDI-music energy. I used to run a Clannad fan shrine on GeoCities with a hit counter that said like 47 visitors. One of them was my mom. Good times. 🖥️',
    mood: 'nostalgic',
  },
]

async function main() {
  await db.comment.deleteMany()
  await db.anime.deleteMany()

  for (const anime of animeData) {
    await db.anime.create({ data: anime })
  }
  for (const comment of commentData) {
    await db.comment.create({ data: comment })
  }
  console.log(`Seeded ${animeData.length} anime and ${commentData.length} comments`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

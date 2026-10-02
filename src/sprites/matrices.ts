/**
 * Pixel Sprite Definitions (12x12 or 16x16 character matrices)
 * Palette mapping:
 * '.' = transparent
 * 'K' = ink (--ink)
 * 'S' = ink-soft (--ink-soft)
 * 'P' = primary (--primary)
 * 'X' = xp (--xp)
 * 'W' = white / surface (--surface)
 * 'G' = pass / green (--pass)
 * 'R' = fail / red (--fail)
 * 'L' = line / border (--line)
 * 'D' = gold
 * 'A' = silver
 * 'B' = bronze
 */

export type SpriteName =
  | 'socrates-neutral'
  | 'socrates-thinking'
  | 'socrates-cheering'
  | 'hero'
  | 'climber'
  | 'chest'
  | 'padlock'
  | 'bug'
  | 'cartridge'
  | 'rank-s'
  | 'rank-a'
  | 'rank-b'
  | 'rank-c'
  | 'rank-d'
  | 'avatar-hero'
  | 'avatar-wizard'
  | 'avatar-robot'
  | 'avatar-cat'
  | 'avatar-ghost'
  | 'avatar-knight'
  | 'trophy-gold'
  | 'trophy-silver'
  | 'trophy-bronze'
  | 'cpu'
  | 'logo-js'
  | 'logo-py'
  | 'keyboard'
  | 'star'
  | 'bulb'
  | 'gear'
  | 'book'
  | 'puzzle'
  | 'arrow-right';

export const SPRITE_MATRICES: Record<SpriteName, { size: number; rows: string[] }> = {
  // Socrates Coach (16x16)
  'socrates-neutral': {
    size: 16,
    rows: [
      '....KKKKKKKK....',
      '...KWWWWWWWWK...',
      '..KWWWWWWWWWWK..',
      '..KWKKWWWWKKWK..',
      '..KWKKWWWWKKWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWWPPWWWWK..',
      '..KWWPPPPPPWWK..',
      '...KWWWWWWWWK...',
      '..KKWWWWWWWWKK..',
      '.KPPKKKKKKKKPPK.',
      '.KPPPPPPPPPPPPK.',
      '.KPPKPPPPPPKPPK.',
      '..KK.KKKKKK.KK..',
      '................',
    ],
  },
  'socrates-thinking': {
    size: 16,
    rows: [
      '....KKKKKKKK....',
      '...KWWWWWWWWK...',
      '..KWWWWWWWWWWK..',
      '..KWKKWWWWWWWK..',
      '..KWKKWWWWKKWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWWPPWWWWK..',
      '..KWWPPPPPPWWK..',
      '...KWWWWWWWWK.X.',
      '..KKWWWWWWWWKKXX',
      '.KPPKKKKKKKKPPKX',
      '.KPPPPPPPKPPPK..',
      '.KPPKPPPPPPKPPK.',
      '..KK.KKKKKK.KK..',
      '................',
    ],
  },
  'socrates-cheering': {
    size: 16,
    rows: [
      'X...KKKKKKKK...X',
      'XX.KWWWWWWWWK.XX',
      '.XKWWWWWWWWWWKX.',
      '..KWKKWWWWKKWK..',
      '..KWKKWWWWKKWK..',
      '..KWWWWWWWWWWK..',
      '..KWWKKKKKKWWK..',
      '..KWWKWWWWKWWK..',
      '..KWWPPPPPPWWK..',
      '...KWWWWWWWWK...',
      '..KKWWWWWWWWKK..',
      '.KPPKKKKKKKKPPK.',
      '.KPPPPPPPPPPPPK.',
      '.KPPKPPPPPPKPPK.',
      '..KK.KKKKKK.KK..',
      '................',
    ],
  },

  // Hero climber
  'hero': {
    size: 12,
    rows: [
      '....XXXX....',
      '...XWWWWX...',
      '...XWKWWX...',
      '...XWWWWX...',
      '....PPPP....',
      '...PPPPPP...',
      '..P.PPPP.P..',
      '..P.PPPP.P..',
      '....KKKK....',
      '....K..K....',
      '...KK..KK...',
      '............',
    ],
  },
  'climber': {
    size: 12,
    rows: [
      '....XXXX.P..',
      '...XWWWWXP..',
      '...XWKWWX...',
      '...XWWWWX...',
      '..P.PPPP....',
      '..P.PPPPP...',
      '....PPPP.P..',
      '....KKKK.P..',
      '...KK..K....',
      '...K...KK...',
      '............',
      '............',
    ],
  },

  // Chest (Locked / Reveal)
  'chest': {
    size: 12,
    rows: [
      '..LLLLLLLL..',
      '.LXXXXXXXXL.',
      '.LXXDDDDXXL.',
      '.LXXXXXXXXL.',
      'LLLLLLLLLLLL',
      'LXXXXXXXXXXL',
      'LXXXXDDXXXXL',
      'LXXXXDDXXXXL',
      'LXXXXXXXXXXL',
      'LLLLLLLLLLLL',
      '............',
      '............',
    ],
  },

  // Padlock
  'padlock': {
    size: 12,
    rows: [
      '....LLLL....',
      '...L....L...',
      '..L......L..',
      '..L......L..',
      '.LLLLLLLLLL.',
      '.LXXXXXXXXL.',
      '.LXXXLLXXXL.',
      '.LXXXLLXXXL.',
      '.LXXXXXXXXL.',
      '.LLLLLLLLLL.',
      '............',
      '............',
    ],
  },

  // Bug
  'bug': {
    size: 12,
    rows: [
      '.R..RRRR..R.',
      '..R.RRRR.R..',
      '...RRRRRR...',
      '..RRWWRRWRR.',
      '..RRKRRRKRR.',
      'RRRRRRRRRRRR',
      '..RRRRRRRR..',
      'RRRRRRRRRRRR',
      '..RRRRRRRR..',
      '.R..R..R..R.',
      'R..........R',
      '............',
    ],
  },

  // Cartridge
  'cartridge': {
    size: 12,
    rows: [
      '.LLLLLLLLLL.',
      '.LPPPPPPPPL.',
      '.LPLLLLLLPL.',
      '.LPLXXXXLPL.',
      '.LPLXXXXLPL.',
      '.LPLLLLLLPL.',
      '.LPPPPPPPPL.',
      '.LPPPPPPPPL.',
      '.LLLLLLLLLL.',
      '..L.L..L.L..',
      '..L.L..L.L..',
      '............',
    ],
  },

  // Rank Badges S, A, B, C, D
  'rank-s': {
    size: 12,
    rows: [
      '..XXXXXXXX..',
      '.XXXXXXXXXX.',
      '.XXKKKKKKXX.',
      '.XXKXXXXXXX.',
      '.XXKKKKKKXX.',
      '.XXXXXXXKXX.',
      '.XXKKKKKKXX.',
      '.XXXXXXXXXX.',
      '..XXXXXXXX..',
      '............',
      '............',
      '............',
    ],
  },
  'rank-a': {
    size: 12,
    rows: [
      '..GGGGGGGG..',
      '.GGGGGGGGGG.',
      '.GGKKKKKKGG.',
      '.GGKGGGGKGG.',
      '.GGKKKKKKGG.',
      '.GGKGGGGKGG.',
      '.GGKGGGGKGG.',
      '.GGGGGGGGGG.',
      '..GGGGGGGG..',
      '............',
      '............',
      '............',
    ],
  },
  'rank-b': {
    size: 12,
    rows: [
      '..PPPPPPPP..',
      '.PPPPPPPPPP.',
      '.PPKKKKKPPP.',
      '.PPKGGGGKPP.',
      '.PPKKKKKPPP.',
      '.PPKGGGGKPP.',
      '.PPKKKKKPPP.',
      '.PPPPPPPPPP.',
      '..PPPPPPPP..',
      '............',
      '............',
      '............',
    ],
  },
  'rank-c': {
    size: 12,
    rows: [
      '..SSSSSSSS..',
      '.SSSSSSSSSS.',
      '.SSKKKKKKSS.',
      '.SSKSSSSSSS.',
      '.SSKSSSSSSS.',
      '.SSKSSSSSSS.',
      '.SSKKKKKKSS.',
      '.SSSSSSSSSS.',
      '..SSSSSSSS..',
      '............',
      '............',
      '............',
    ],
  },
  'rank-d': {
    size: 12,
    rows: [
      '..RRRRRRRR..',
      '.RRRRRRRRRR.',
      '.RRKKKKKRRR.',
      '.RRKRRRRKRR.',
      '.RRKRRRRKRR.',
      '.RRKRRRRKRR.',
      '.RRKKKKKRRR.',
      '.RRRRRRRRRR.',
      '..RRRRRRRR..',
      '............',
      '............',
      '............',
    ],
  },

  // 6 Avatars
  'avatar-hero': {
    size: 12,
    rows: [
      '...XXXXXX...',
      '..XXXXXXXX..',
      '..XWWWWWWX..',
      '..XWKWWKWX..',
      '..XWWWWWWX..',
      '...PPPPPP...',
      '..PPPPPPPP..',
      '..P.PPPP.P..',
      '....KKKK....',
      '...KK..KK...',
      '............',
      '............',
    ],
  },
  'avatar-wizard': {
    size: 12,
    rows: [
      '.....PP.....',
      '....PPPP....',
      '...PPPPPP...',
      '..PPPPPPPP..',
      '..XWWWWWWX..',
      '..XWKWWKWX..',
      '..XWWWWWWX..',
      '..KWWWWWWK..',
      '.KWWWWWWWWK.',
      '..PPPPPPPP..',
      '..PP....PP..',
      '............',
    ],
  },
  'avatar-robot': {
    size: 12,
    rows: [
      '.....LL.....',
      '..LLLLLLLL..',
      '..LGGGGGL...',
      '..LGKGLKGL..',
      '..LGGGGGL...',
      '..LLLLLLLL..',
      '...PPPPPP...',
      '..LLLLLLLL..',
      '..L.LLLL.L..',
      '....LLLL....',
      '...LL..LL...',
      '............',
    ],
  },
  'avatar-cat': {
    size: 12,
    rows: [
      '.XX......XX.',
      '.XXXX..XXXX.',
      '..XXXXXXXX..',
      '.XXXXXXXXXX.',
      '.XXKXXXXKXX.',
      '.XXXXXXXXXX.',
      '..XXKPPKXX..',
      '...XXXXXX...',
      '..XXXXXXXX..',
      '..XX.XX.XX..',
      '..XX....XX..',
      '............',
    ],
  },
  'avatar-ghost': {
    size: 12,
    rows: [
      '...WWWWWW...',
      '..WWWWWWWW..',
      '.WWWWWWWWWW.',
      '.WWKKWWKKWW.',
      '.WWKKWWKKWW.',
      '.WWWWWWWWWW.',
      '.WWWWWWWWWW.',
      '.WWWWWWWWWW.',
      '.WW.WWWW.WW.',
      '.W...WW...W.',
      '............',
      '............',
    ],
  },
  'avatar-knight': {
    size: 12,
    rows: [
      '...LLLLLL...',
      '..LLLLLLLL..',
      '..LLLLLLLL..',
      '..LLKKKKLL..',
      '..LLLLLLLL..',
      '..LLLKLLLL..',
      '...LLLLLL...',
      '..LLLLLLLL..',
      '.LL.LLLL.LL.',
      '....LLLL....',
      '...LL..LL...',
      '............',
    ],
  },

  // Trophies
  'trophy-gold': {
    size: 12,
    rows: [
      '.DDDDDDDDDD.',
      'D.DDDDDDDD.D',
      'D.DDDDDDDD.D',
      '.D.DDDDDD.D.',
      '..DDDDDDDD..',
      '...DDDDDD...',
      '....DDDD....',
      '.....DD.....',
      '....DDDD....',
      '...DDDDDD...',
      '..DDDDDDDD..',
      '............',
    ],
  },
  'trophy-silver': {
    size: 12,
    rows: [
      '.AAAAAAAAAA.',
      'A.AAAAAAAA.A',
      'A.AAAAAAAA.A',
      '.A.AAAAAA.A.',
      '..AAAAAAAA..',
      '...AAAAAA...',
      '....AAAA....',
      '.....AA.....',
      '....AAAA....',
      '...AAAAAA...',
      '..AAAAAAAA..',
      '............',
    ],
  },
  'trophy-bronze': {
    size: 12,
    rows: [
      '.BBBBBBBBBB.',
      'B.BBBBBBBB.B',
      'B.BBBBBBBB.B',
      '.B.BBBBBB.B.',
      '..BBBBBBBB..',
      '...BBBBBB...',
      '....BBBB....',
      '.....BB.....',
      '....BBBB....',
      '...BBBBBB...',
      '..BBBBBBBB..',
      '............',
    ],
  },

  // CPU Badge
  'cpu': {
    size: 12,
    rows: [
      '..L..L..L...',
      '.LLLLLLLLLL.',
      'LLKKK.KKK.KLL',
      '.LKKK.KKK.KL.',
      'LLKKK.KKK.KLL',
      '.LKKK.KKK.KL.',
      'LLKKK.KKK.KLL',
      '.LLLLLLLLLL.',
      '..L..L..L...',
      '............',
      '............',
      '............',
    ],
  },

  // Language pixel logos
  'logo-js': {
    size: 12,
    rows: [
      'XXXXXXXXXXXX',
      'XXXXXXXXXXXX',
      'XXXXXXX..XXX',
      'XXXXXXX..XXX',
      'XXX..XX..XXX',
      'XXX..XX..XXX',
      'XXX..XX..XXX',
      'XX...XX..XXX',
      'XXXX.XX..XXX',
      'XX..XXXX.XXX',
      'XXXXXXXXXXXX',
      'XXXXXXXXXXXX',
    ],
  },
  'logo-py': {
    size: 12,
    rows: [
      '...PPPPPP...',
      '..PPPPPPPP..',
      '..PPWPPPPPP.',
      '..PPPPPPPP..',
      '..PPPPXXXXX.',
      '.XXXXXXPXXXX',
      '.XXXXXXPXXXX',
      '.XXXXXPXXXX.',
      '..XXXXXXXX..',
      '..XXXXWXXX..',
      '..XXXXXXXX..',
      '...XXXXXX...',
    ],
  },
  'keyboard': {
    size: 12,
    rows: [
      '..LLLLLLLL..',
      '.LWWWWWWWWL.',
      '.LWK.WK.WKWL',
      '.LWK.WK.WKWL',
      '.LWWWWWWWWL.',
      '.LWKKKKKKWWL',
      '.LWWWWWWWWL.',
      '.LLLLLLLLLL.',
      '............',
      '............',
      '............',
      '............',
    ],
  },
  'star': {
    size: 12,
    rows: [
      '.....XX.....',
      '....XXXX....',
      '....XXXX....',
      '.XXXXXXXXXX.',
      '..XXXXXXXX..',
      '...XXXXXX...',
      '..XXXXXXXX..',
      '.XX.XXXX.XX.',
      '.X..XXXX..X.',
      '....X..X....',
      '............',
      '............',
    ],
  },
  'bulb': {
    size: 12,
    rows: [
      '....XXXX....',
      '...XXXXXX...',
      '..XXXXXXXX..',
      '..XXXXXXXX..',
      '...XXXXXX...',
      '....XXXX....',
      '....SSSS....',
      '....WWWW....',
      '.....SS.....',
      '............',
      '............',
      '............',
    ],
  },
  'gear': {
    size: 12,
    rows: [
      '....SSSS....',
      '..SSSWWSSS..',
      '.SS.SSSS.SS.',
      '.SSSSSSSSSS.',
      'SWSS....SSWS',
      'SWSS....SSWS',
      '.SSSSSSSSSS.',
      '.SS.SSSS.SS.',
      '..SSSWWSSS..',
      '....SSSS....',
      '............',
      '............',
    ],
  },
  'book': {
    size: 12,
    rows: [
      '..LL....LL..',
      '.LWWL..LWWL.',
      '.LWWL..LWWL.',
      '.LWWL..LWWL.',
      '.LWWL..LWWL.',
      '.LWWL..LWWL.',
      '.LWWLLLLWWL.',
      '.LLLLLLLLLL.',
      '............',
      '............',
      '............',
      '............',
    ],
  },
  'puzzle': {
    size: 12,
    rows: [
      '....PPPP....',
      '...PPPPPP...',
      'LLLLPPPPLLLL',
      'LPPPPPPPPPPL',
      'LPPPPPPPPPPL',
      'LPPPPPPPPPPL',
      'LPPPPPPPPPPL',
      'LLLLPPPPLLLL',
      '...PPPPPP...',
      '....PPPP....',
      '............',
      '............',
    ],
  },
  'arrow-right': {
    size: 12,
    rows: [
      '......P.....',
      '......PP....',
      '......PPP...',
      'PPPPPPPPPP..',
      'PPPPPPPPPPP.',
      'PPPPPPPPPPPP',
      'PPPPPPPPPPP.',
      'PPPPPPPPPP..',
      '......PPP...',
      '......PP....',
      '......P.....',
      '............',
    ],
  },
};

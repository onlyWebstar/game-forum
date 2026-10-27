// scripts/seedDemo.js
//
// Adds demo content (games, demo users, posts, nested comments, likes) so the
// site does not look empty. It is SAFE to run against live database:
//   - it never deletes or overwrites anything
//   - it skips whatever already exists, so running it twice is fine
//
// Usage:  npm run seed:demo
//
// It uses MONGODB_URI from your .env. Use the SAME connection string your
// Render backend uses, so the content lands in the database your site reads.

require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Game = require('../models/Game');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

const MONGODB_URI = process.env.MONGODB_URI;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoPass123!';
const DEMO_LOGIN_EMAIL = 'demo.player@nexus.example';

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

// Seeded random numbers, so every run produces the same "random" data
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rng = mulberry32(20261027);
const rand = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const sample = (arr, n) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

const DAY = 24 * 60 * 60 * 1000;
const ago = (days, extraMinutes = 0) => new Date(Date.now() - days * DAY + extraMinutes * 60 * 1000);

// Same slug rule as models/Game.js
const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Level from experience points (the app will use the same formula later)
const levelFromXp = (xp) => 1 + Math.floor(Math.sqrt((xp || 0) / 50));

// Back-date a document without Mongoose touching updatedAt again
const setDates = (Model, id, createdAt, extra = {}) =>
  Model.updateOne(
    { _id: id },
    { $set: { createdAt, updatedAt: createdAt, ...extra } },
    { timestamps: false }
  );

/* ------------------------------------------------------------------ */
/* Generated cover + banner art (self-contained, nothing to break)     */
/* ------------------------------------------------------------------ */

const hashStr = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (title, max) => {
  const lines = [];
  let cur = '';
  for (const w of title.split(/\s+/)) {
    if (cur && `${cur} ${w}`.length > max) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 5);
};
const toDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const makeCover = (title) => {
  const h = hashStr(title) % 360;
  const lines = wrap(title, 12);
  const startY = 400 - ((lines.length - 1) * 68) / 2;
  const text = lines
    .map(
      (l, i) =>
        `<text x='300' y='${startY + i * 68}' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='54' font-weight='700' fill='white'>${esc(l)}</text>`
    )
    .join('');
  return toDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='hsl(${h},70%,38%)'/>` +
      `<stop offset='1' stop-color='hsl(${(h + 70) % 360},70%,16%)'/></linearGradient></defs>` +
      `<rect width='600' height='800' fill='url(#g)'/>` +
      `<circle cx='500' cy='120' r='190' fill='white' fill-opacity='0.07'/>` +
      `<circle cx='80' cy='720' r='150' fill='white' fill-opacity='0.06'/>` +
      text +
      `<text x='300' y='740' text-anchor='middle' font-family='Arial, sans-serif' font-size='22' letter-spacing='6' fill='white' fill-opacity='0.55'>NEXUS</text>` +
      `</svg>`
  );
};

const makeBanner = (title) => {
  const h = hashStr(title) % 360;
  return toDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='500' viewBox='0 0 1600 500'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='hsl(${h},70%,32%)'/>` +
      `<stop offset='1' stop-color='hsl(${(h + 80) % 360},70%,12%)'/></linearGradient></defs>` +
      `<rect width='1600' height='500' fill='url(#g)'/>` +
      `<circle cx='1350' cy='80' r='320' fill='white' fill-opacity='0.06'/>` +
      `<circle cx='250' cy='520' r='260' fill='white' fill-opacity='0.05'/>` +
      `<circle cx='800' cy='250' r='120' fill='white' fill-opacity='0.04'/>` +
      `</svg>`
  );
};

/* ------------------------------------------------------------------ */
/* Demo users                                                          */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS = ['6366f1', '8b5cf6', '06b6d4', '10b981', 'f59e0b', 'ef4444', 'ec4899'];

const DEMO_USERS = [
  {
    key: 'demo',
    username: 'demo_player',
    email: DEMO_LOGIN_EMAIL,
    loginable: true,
    bio: 'Demo account for exploring NEXUS. Post, comment and like to your heart\'s content!',
  },
  {
    key: 'mod',
    username: 'nexus_mod',
    email: 'mod@nexus.example',
    role: 'moderator',
    bio: 'Keeping the community friendly. Ask me about the rules.',
  },
  {
    key: 'luna',
    username: 'luna_plays',
    email: 'luna@nexus.example',
    bio: 'RPG addict. Hundreds of hours in Baldur\'s Gate 3 and counting.',
  },
  {
    key: 'rex',
    username: 'retro_rex',
    email: 'rex@nexus.example',
    bio: 'Collecting cartridges since 1996. Open-world explorer.',
  },
  {
    key: 'sam',
    username: 'speedrun_sam',
    email: 'sam@nexus.example',
    bio: 'Any% or bust. I write guides so you die less.',
  },
  {
    key: 'cora',
    username: 'cozy_cora',
    email: 'cora@nexus.example',
    bio: 'Farming sims, tea and good soundtracks.',
  },
  {
    key: 'kai',
    username: 'kai_fps',
    email: 'kai@nexus.example',
    bio: 'Aim trainers, angles and way too much coffee.',
  },
];

/* ------------------------------------------------------------------ */
/* Games                                                               */
/* ------------------------------------------------------------------ */

const GAMES = [
  {
    title: 'Elden Ring',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: '2022-02-25',
    genres: ['Action', 'RPG'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One'],
    metacriticScore: 96,
    officialWebsite: 'https://en.bandainamcoent.eu/elden-ring/elden-ring',
    featured: true,
    short: 'A vast open-world action RPG from FromSoftware.',
    description:
      "Explore the Lands Between in a huge open-world action RPG built by FromSoftware. Hunt for weapons and spells, ride across enormous landscapes, and take on towering bosses in some of the genre's most demanding fights.",
    tags: ['Open World', 'Souls-like', 'Challenging'],
  },
  {
    title: "Baldur's Gate 3",
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    releaseDate: '2023-08-03',
    genres: ['RPG', 'Strategy'],
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    metacriticScore: 96,
    officialWebsite: 'https://baldursgate3.game/',
    featured: true,
    short: 'A party-based RPG where your choices shape the story.',
    description:
      'A party-based RPG set in the Dungeons & Dragons universe. Your choices shape the story, your companions and the world, with turn-based combat that rewards creative problem solving.',
    tags: ['Turn-Based', 'Story-Rich', 'Co-op'],
  },
  {
    title: 'The Legend of Zelda: Tears of the Kingdom',
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    releaseDate: '2023-05-12',
    genres: ['Action', 'Adventure'],
    platforms: ['Nintendo Switch'],
    metacriticScore: 96,
    officialWebsite: 'https://www.zelda.com/tears-of-the-kingdom/',
    featured: true,
    short: 'Hyrule from the sky to the depths, with build-anything freedom.',
    description:
      'Return to Hyrule in an open-world adventure that stretches from the surface to the sky and deep underground. Build vehicles and contraptions with your abilities to solve puzzles and explore.',
    tags: ['Open World', 'Puzzle', 'Exploration'],
  },
  {
    title: 'Hades',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    releaseDate: '2020-09-17',
    genres: ['Action', 'Indie'],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One'],
    metacriticScore: 93,
    officialWebsite: 'https://www.supergiantgames.com/games/hades/',
    featured: true,
    short: 'A fast, stylish roguelike set in the Greek Underworld.',
    description:
      'A fast, stylish roguelike where you fight out of the Underworld as the prince Zagreus. Every escape attempt unlocks new weapons, boons and story.',
    tags: ['Roguelike', 'Mythology', 'Fast-Paced'],
  },
  {
    title: 'Cyberpunk 2077',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    releaseDate: '2020-12-10',
    genres: ['Action', 'RPG'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One'],
    metacriticScore: 86,
    officialWebsite: 'https://www.cyberpunk.net/',
    short: 'An open-world action RPG set in the neon sprawl of Night City.',
    description:
      "An open-world action RPG set in the neon-soaked Night City. Shape your character's skills and cyberware, and decide how to take on each job.",
    tags: ['Sci-Fi', 'Open World', 'Story-Rich'],
  },
  {
    title: 'Red Dead Redemption 2',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: '2018-10-26',
    genres: ['Action', 'Adventure'],
    platforms: ['PC', 'PlayStation 4', 'Xbox One'],
    metacriticScore: 97,
    officialWebsite: 'https://www.rockstargames.com/reddeadredemption2',
    featured: true,
    short: 'An epic outlaw story in a huge, detailed open world.',
    description:
      'An epic tale of outlaw life in the final days of the American frontier. A huge, detailed open world with a story-driven campaign and a lot of small moments to find.',
    tags: ['Open World', 'Western', 'Story-Rich'],
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    releaseDate: '2015-05-19',
    genres: ['RPG', 'Action'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch'],
    metacriticScore: 93,
    officialWebsite: 'https://www.thewitcher.com/',
    short: 'A sprawling monster-hunting RPG full of morally grey choices.',
    description:
      'Play as monster hunter Geralt of Rivia in a sprawling open-world RPG full of morally grey choices, memorable side quests and dangerous creatures.',
    tags: ['Open World', 'Fantasy', 'Story-Rich'],
  },
  {
    title: 'God of War Ragnarök',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2022-11-09',
    genres: ['Action', 'Adventure'],
    platforms: ['PlayStation 5', 'PlayStation 4', 'PC'],
    metacriticScore: 94,
    officialWebsite: 'https://www.playstation.com/games/god-of-war-ragnarok/',
    short: 'Kratos and Atreus take on the Nine Realms as Ragnarök looms.',
    description:
      'Kratos and Atreus journey across the Nine Realms in this cinematic action adventure as Ragnarök looms.',
    tags: ['Mythology', 'Cinematic', 'Combat'],
  },
  {
    title: 'Hollow Knight',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    releaseDate: '2017-02-24',
    genres: ['Indie', 'Platformer', 'Adventure'],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metacriticScore: 87,
    officialWebsite: 'https://www.hollowknight.com/',
    featured: true,
    short: 'A hand-drawn metroidvania in the ruined kingdom of Hallownest.',
    description:
      'A hand-drawn metroidvania set in the ruined insect kingdom of Hallownest. Explore winding caverns, fight challenging bosses and uncover a haunting story.',
    tags: ['Metroidvania', 'Challenging', 'Atmospheric'],
  },
  {
    title: 'Celeste',
    developer: 'Maddy Makes Games',
    publisher: 'Maddy Makes Games',
    releaseDate: '2018-01-25',
    genres: ['Indie', 'Platformer'],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metacriticScore: 94,
    officialWebsite: 'https://www.celestegame.com/',
    short: 'A tight, heartfelt platformer about climbing a mountain.',
    description:
      'A tightly designed platformer about climbing a mountain and facing your own struggles along the way. Tough but fair, with optional assist features.',
    tags: ['Precision', 'Story-Rich', 'Pixel Art'],
  },
  {
    title: 'Stardew Valley',
    developer: 'ConcernedApe',
    publisher: 'ConcernedApe',
    releaseDate: '2016-02-26',
    genres: ['Simulation', 'RPG', 'Indie'],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One', 'Mobile'],
    metacriticScore: 89,
    officialWebsite: 'https://www.stardewvalley.net/',
    short: 'Build the farm and the life you want.',
    description:
      'Inherit a run-down farm and build the life you want: grow crops, raise animals, fish, mine, and get to know the townsfolk.',
    tags: ['Farming', 'Cozy', 'Co-op'],
  },
  {
    title: 'Minecraft',
    developer: 'Mojang Studios',
    publisher: 'Mojang Studios',
    releaseDate: '2011-11-18',
    genres: ['Adventure', 'Simulation'],
    platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch', 'Mobile'],
    metacriticScore: null,
    officialWebsite: 'https://www.minecraft.net/',
    short: 'Build, craft and survive in endless worlds.',
    description:
      'A sandbox game about building, crafting and surviving in endless procedurally generated worlds, solo or with friends.',
    tags: ['Sandbox', 'Crafting', 'Co-op'],
  },
  {
    title: 'Counter-Strike 2',
    developer: 'Valve',
    publisher: 'Valve',
    releaseDate: '2023-09-27',
    genres: ['FPS'],
    platforms: ['PC'],
    metacriticScore: null,
    officialWebsite: 'https://www.counter-strike.net/',
    short: 'Valve\'s competitive tactical shooter.',
    description:
      "Valve's competitive tactical shooter: two teams, one bomb, and rounds that reward teamwork, aim and smart economy decisions.",
    tags: ['Competitive', 'Tactical', 'Multiplayer'],
  },
  {
    title: 'Valorant',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    releaseDate: '2020-06-02',
    genres: ['FPS'],
    platforms: ['PC'],
    metacriticScore: null,
    officialWebsite: 'https://playvalorant.com/',
    short: 'A 5v5 tactical shooter with agent abilities.',
    description:
      'A 5v5 tactical shooter where precise gunplay meets unique agent abilities.',
    tags: ['Competitive', 'Hero Shooter', 'Multiplayer'],
  },
  {
    title: 'Forza Horizon 5',
    developer: 'Playground Games',
    publisher: 'Xbox Game Studios',
    releaseDate: '2021-11-09',
    genres: ['Racing'],
    platforms: ['PC', 'Xbox One', 'Xbox Series X/S'],
    metacriticScore: 92,
    officialWebsite: 'https://forza.net/horizon',
    short: 'An open-world racing festival set in Mexico.',
    description:
      'An open-world racing festival set across a vibrant recreation of Mexico, with hundreds of cars and events for every taste.',
    tags: ['Open World', 'Cars', 'Casual'],
  },
  {
    title: 'Resident Evil 4',
    developer: 'Capcom',
    publisher: 'Capcom',
    releaseDate: '2023-03-24',
    genres: ['Horror', 'Action'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S'],
    metacriticScore: 93,
    officialWebsite: 'https://www.residentevil.com/re4/',
    short: 'The survival-horror classic, reimagined.',
    description:
      "A reimagining of the survival horror classic: Leon S. Kennedy must rescue the US president's daughter from a village with a sinister secret.",
    tags: ['Survival Horror', 'Remake', 'Action'],
  },
  {
    title: 'Street Fighter 6',
    developer: 'Capcom',
    publisher: 'Capcom',
    releaseDate: '2023-06-02',
    genres: ['Fighting'],
    platforms: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S'],
    metacriticScore: 92,
    officialWebsite: 'https://www.streetfighter.com/6/',
    short: 'Capcom\'s fighter with World Tour and Battle Hub modes.',
    description:
      "Capcom's fighting game with a deep roster, a story-driven World Tour mode, and a lively online Battle Hub.",
    tags: ['Fighting', 'Competitive', 'Online'],
  },
  {
    title: 'Super Mario Odyssey',
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    releaseDate: '2017-10-27',
    genres: ['Platformer', 'Adventure'],
    platforms: ['Nintendo Switch'],
    metacriticScore: 97,
    officialWebsite: 'https://supermario-odyssey.nintendo.com/',
    short: 'A globe-trotting 3D platformer packed with Power Moons.',
    description:
      'Join Mario and Cappy on a globe-trotting 3D platforming adventure packed with creative kingdoms and hidden Power Moons.',
    tags: ['3D Platformer', 'Family', 'Exploration'],
  },
];

/* ------------------------------------------------------------------ */
/* Posts with nested comments                                          */
/* ------------------------------------------------------------------ */

const POSTS = [
  {
    game: 'Elden Ring', by: 'mod', type: 'discussion', pinned: true, daysAgo: 29,
    title: 'Please tag spoilers - a quick reminder',
    content: `Hi everyone!\n\nElden Ring is full of surprises, so please keep spoilers out of post titles, and say in the first line if your post covers late-game areas or bosses. New players will thank you.\n\nNot sure whether something is a spoiler? Add "(spoilers)" to the title. Thanks for keeping NEXUS friendly!`,
    tags: ['community', 'spoilers'],
    comments: [
      { by: 'luna', text: `Great reminder. I nearly got spoiled on a boss name last week.`, replies: [{ by: 'mod', text: `Thanks Luna, we'll keep an eye on titles.` }] },
      { by: 'sam', text: `Will do. Is there a spoiler tag in the post form yet?`, replies: [{ by: 'mod', text: `Not yet. For now, put "(spoilers)" in the title.` }] },
    ],
  },
  {
    game: 'Elden Ring', by: 'sam', type: 'guide', daysAgo: 24,
    title: `Beginner's guide: surviving Limgrave`,
    content: `I spent my first 20 hours in Limgrave. Here is what I wish I had known:\n\n1. Don't rush the first big boss. Explore Stormhill and the nearby catacombs first.\n2. Torrent is your friend. Ride past enemies you can't handle yet.\n3. Put your early levels into Vigor before anything else.\n4. Upgrade your weapon steadily with smithing stones from the mines.\n5. Rest at Sites of Grace often. They're everywhere for a reason.`,
    tags: ['guide', 'beginner'],
    comments: [
      { by: 'cora', text: `The Vigor tip alone would have saved me a dozen deaths.`, replies: [] },
      { by: 'kai', text: `Also: summon Spirit Ashes before bosses, it splits their attention.`, replies: [{ by: 'sam', text: `Good call. The early Spirit Ashes carried my first playthrough.` }] },
    ],
  },
  {
    game: "Baldur's Gate 3", by: 'luna', type: 'review', daysAgo: 22,
    title: `Review: 150 hours later, it still surprises me`,
    content: `I keep finding new ways for scenes to play out. Companions react to your choices, the dialogue is sharp, and almost every encounter has more than one solution.\n\nMy only complaints: the third act can be rough on older machines, and the inventory gets messy fast. Even so, it's the best RPG I've played in years.\n\nVerdict: 10/10, would roll for initiative again.`,
    tags: ['review', 'rpg'],
    comments: [
      { by: 'rex', text: `Act 3 performance was rough on my old laptop, but the story is unreal.`, replies: [{ by: 'luna', text: `Same, though the patches helped a lot.` }] },
      { by: 'demo', text: `Which character did you start with?`, replies: [{ by: 'luna', text: `Started with a custom character, then replayed as the Dark Urge. Wildly different experience.` }] },
    ],
  },
  {
    game: "Baldur's Gate 3", by: 'demo', type: 'question', daysAgo: 18,
    title: `Best party composition for a first playthrough?`,
    content: `I'm about to start and I don't want to regret my pick.\n\nIs it worth playing a pure caster, or is a balanced party safer? I've never played a D&D-style game before, so please be gentle.`,
    tags: ['party', 'beginner'],
    comments: [
      { by: 'luna', text: `Balanced is safest: a tank, a healer, a caster and someone for locks and traps. You can respec later anyway.`, replies: [{ by: 'demo', text: `That's reassuring, thank you!` }] },
      { by: 'sam', text: `Whatever you pick, save before big fights and experiment. The game is very forgiving about it.`, replies: [] },
    ],
  },
  {
    game: 'The Legend of Zelda: Tears of the Kingdom', by: 'rex', type: 'discussion', daysAgo: 20,
    title: `Tears of the Kingdom vs Breath of the Wild: which is better?`,
    content: `Both are masterpieces, but I keep going back and forth.\n\nUltrahand and Fuse make exploration feel limitless, while BotW's first moments on the Great Plateau felt more magical because everything was new.\n\nWhat's your take?`,
    tags: ['zelda', 'comparison'],
    comments: [
      { by: 'cora', text: `TotK for the creativity. I built a ridiculous flying machine just for fun.`, replies: [{ by: 'rex', text: `Okay, that's amazing. Mine just fell apart.` }] },
      { by: 'kai', text: `BotW. The depths were cool, but the sky islands felt repetitive after a while.`, replies: [{ by: 'cora', text: `Fair! The Depths were my favourite part though.` }] },
    ],
  },
  {
    game: 'Hades', by: 'cora', type: 'review', daysAgo: 16,
    title: `Hades made me fall in love with roguelikes`,
    content: `I usually bounce off roguelikes because losing progress feels bad. Hades fixes that: every run moves the story forward, so failing never feels wasted.\n\nThe combat is snappy, the music is great, and the characters are a delight. Highly recommended even if you think the genre isn't for you.`,
    tags: ['review', 'roguelike'],
    comments: [
      { by: 'sam', text: `The writing is why I stayed. Trying every weapon aspect is the real endgame.`, replies: [] },
      { by: 'luna', text: `I'm still chasing my highest heat run. Wish me luck.`, replies: [] },
    ],
  },
  {
    game: 'Red Dead Redemption 2', by: 'rex', type: 'discussion', daysAgo: 14,
    title: `The little details that make RDR2 feel alive`,
    content: `Bonding with your horse, the camp conversations, how the weather changes the mood of a ride... RDR2 is full of tiny things you only notice by slowing down.\n\nWhat are your favourite small details?`,
    tags: ['rdr2', 'immersion'],
    comments: [
      { by: 'demo', text: `The horse bonding is so underrated. You really do start to care about the animal.`, replies: [] },
      { by: 'kai', text: `I once lost an entire evening just fishing.`, replies: [{ by: 'rex', text: `Same, and zero regrets.` }] },
    ],
  },
  {
    game: 'Cyberpunk 2077', by: 'kai', type: 'discussion', daysAgo: 12,
    title: `Is Cyberpunk 2077 worth playing now?`,
    content: `I skipped the launch because of the bugs. With the updates and the expansion, is it finally the game that was promised?\n\nLooking for honest opinions, not hype.`,
    tags: ['cyberpunk', 'patches'],
    comments: [
      { by: 'luna', text: `Yes. The game after the big patches is very different from the launch version. Go in for the story and the characters.`, replies: [{ by: 'kai', text: `Sold, adding it to my list.` }] },
      { by: 'sam', text: `Pick a build around hacking or pistols for a smooth start.`, replies: [] },
    ],
  },
  {
    game: 'Hollow Knight', by: 'sam', type: 'guide', daysAgo: 10,
    title: `Hollow Knight: tips for your first hours`,
    content: `A few things that helped me early on:\n\n- Listen for humming. It usually means a mapmaker is close, and maps are worth buying.\n- Rest at benches often and don't be afraid to leave a tough boss and come back stronger.\n- Experiment with charms. The right combination changes how a fight feels.\n- Take your time. The game rewards curiosity.`,
    tags: ['guide', 'beginner'],
    comments: [
      { by: 'cora', text: `The humming is the best sound-design trick ever.`, replies: [] },
      { by: 'demo', text: `Any advice for the Mantis Lords?`, replies: [{ by: 'sam', text: `It's a rhythm fight. Learn the patterns and don't get greedy.` }] },
    ],
  },
  {
    game: 'Stardew Valley', by: 'cora', type: 'discussion', daysAgo: 9,
    title: `Cozy farm layouts: show me yours!`,
    content: `I've been rebuilding my farm for the third time and I'm running out of ideas.\n\nDo you go for efficiency, or for something pretty? Describe your layout or share your favourite design tips.`,
    tags: ['stardew', 'farming'],
    comments: [
      { by: 'luna', text: `Standard farm with a little fish pond corner. Very unoptimised, very happy.`, replies: [] },
      { by: 'rex', text: `Four Corners for co-op with my brother. Everyone gets their own patch.`, replies: [] },
    ],
  },
  {
    game: 'Celeste', by: 'kai', type: 'review', daysAgo: 7,
    title: `Celeste: hard, kind and unforgettable`,
    content: `Celeste is a precise platformer, but it never feels mean. The controls are tight, the checkpoints are generous, and the story is surprisingly personal.\n\nIf you've been put off by the difficulty, try the assist options. They're there to help you finish the climb.`,
    tags: ['review', 'platformer'],
    comments: [
      { by: 'sam', text: `The assist mode is such a thoughtful design choice.`, replies: [] },
    ],
  },
  {
    game: 'Resident Evil 4', by: 'luna', type: 'discussion', daysAgo: 5,
    title: `RE4 Remake: the knife parry changes everything`,
    content: `Parrying with the knife makes close encounters feel tense and rewarding. But the knife wears down, so you have to decide when a parry is worth it.\n\nHow are you using it: saving it for emergencies, or parrying everything?`,
    tags: ['re4', 'combat'],
    comments: [
      { by: 'sam', text: `The knife durability makes you think twice before every parry. I love that.`, replies: [] },
    ],
  },
  {
    game: 'Street Fighter 6', by: 'sam', type: 'question', daysAgo: 3,
    title: `World Tour or Fighting Ground first?`,
    content: `World Tour is a fun way to learn the basics, but I've been spending most of my time in Fighting Ground and the Battle Hub.\n\nWhere did you start, and what would you recommend to a newcomer?`,
    tags: ['sf6', 'beginner'],
    comments: [
      { by: 'demo', text: `World Tour first for me. It made the controls feel less intimidating.`, replies: [] },
      { by: 'kai', text: `Fighting Ground's tutorials are great if you want to learn one character properly.`, replies: [] },
    ],
  },
  {
    game: 'Forza Horizon 5', by: 'rex', type: 'question', daysAgo: 2,
    title: `What's your go-to car for early events?`,
    content: `I'm just getting started and the garage is overwhelming. What would you recommend for the early road and dirt races without spending a fortune?`,
    tags: ['cars', 'tips'],
    comments: [
      { by: 'kai', text: `Anything all-wheel drive for the dirt events. Tune the gearing a little and you're set.`, replies: [] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

const deltas = new Map(); // userId -> counters to add at the end
const bump = (user, field, n = 1) => {
  const key = String(user._id);
  const d = deltas.get(key) || { postsCount: 0, commentsCount: 0, likesReceived: 0, experience: 0 };
  d[field] += n;
  deltas.set(key, d);
};

const run = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to your .env file.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected. Database: "${mongoose.connection.name}" on ${mongoose.connection.host}`);
  console.log('(Make sure this is the same database your live site uses.)\n');

  const stats = { users: 0, games: 0, posts: 0, comments: 0, likes: 0, skippedPosts: 0 };

  /* ----- users ----- */
  const users = {};
  for (let i = 0; i < DEMO_USERS.length; i++) {
    const def = DEMO_USERS[i];
    let user = await User.findOne({ email: def.email });

    if (!user) {
      const takenName = await User.findOne({ username: def.username });
      if (takenName) {
        throw new Error(
          `The username "${def.username}" already belongs to a different account. ` +
            `Rename it in DEMO_USERS and run again.`
        );
      }

      user = new User({
        username: def.username,
        email: def.email,
        password: def.loginable ? DEMO_PASSWORD : crypto.randomBytes(24).toString('hex'),
        role: def.role || 'user',
        bio: def.bio,
        avatar: `https://ui-avatars.com/api/?background=${AVATAR_COLORS[i % AVATAR_COLORS.length]}&color=fff&name=${encodeURIComponent(def.username)}`,
        emailVerified: true,
      });
      await user.save();
      await setDates(User, user._id, ago(rand(35, 70)), { lastSeen: ago(0, -rand(30, 2000)) });
      stats.users++;
    }
    users[def.key] = user;
  }

  /* ----- who "added" the games: an admin if there is one ----- */
  const owner =
    (await User.findOne({ role: 'admin', isActive: true }).sort({ createdAt: 1 })) || users.mod;

  /* ----- games ----- */
  const games = {};
  for (const def of GAMES) {
    let game = await Game.findOne({ slug: slugify(def.title) });
    if (!game) {
      game = await Game.create({
        title: def.title,
        coverImage: makeCover(def.title),
        bannerImage: makeBanner(def.title),
        description: def.description,
        shortDescription: def.short,
        developer: def.developer,
        publisher: def.publisher,
        releaseDate: new Date(`${def.releaseDate}T00:00:00Z`),
        genres: def.genres,
        platforms: def.platforms,
        metacriticScore: def.metacriticScore,
        officialWebsite: def.officialWebsite,
        tags: def.tags,
        isFeatured: !!def.featured,
        viewsCount: rand(150, 4000),
        addedBy: owner._id,
      });
      stats.games++;
    }
    games[def.title] = game;
  }

  /* ----- posts, comments, likes ----- */
  const demoUserList = Object.values(users);

  const addLikes = async (Model, targetType, target, author) => {
    const pool = demoUserList.filter((u) => String(u._id) !== String(author._id));
    const chosen = sample(pool, rand(0, Math.min(pool.length, targetType === 'Post' ? 6 : 4)));
    if (chosen.length === 0) return;

    let likes = 0;
    let dislikes = 0;
    const docs = chosen.map((u) => {
      const value = rng() < 0.08 ? -1 : 1;
      if (value === 1) likes++;
      else dislikes++;
      return { user: u._id, targetType, targetId: target._id, value };
    });

    await Like.insertMany(docs, { ordered: false });
    await Model.updateOne(
      { _id: target._id },
      { $set: { likesCount: likes, dislikesCount: dislikes } },
      { timestamps: false }
    );
    bump(author, 'likesReceived', likes);
    stats.likes += docs.length;
  };

  for (const p of POSTS) {
    const author = users[p.by];
    const game = games[p.game];
    if (!author || !game) throw new Error(`Seed data problem in post "${p.title}"`);

    const exists = await Post.findOne({ title: p.title, author: author._id });
    if (exists) {
      stats.skippedPosts++;
      continue;
    }

    const postDate = ago(p.daysAgo, rand(0, 600));
    const post = await Post.create({
      title: p.title,
      content: p.content,
      author: author._id,
      game: game._id,
      postType: p.type,
      tags: p.tags,
      isPinned: !!p.pinned,
      viewsCount: rand(40, 900),
    });
    stats.posts++;
    bump(author, 'postsCount', 1);
    bump(author, 'experience', 10);
    await Game.updateOne({ _id: game._id }, { $inc: { postsCount: 1 } }, { timestamps: false });

    // Comments (nested). The clock only moves forward, so replies come after parents.
    let clock = postDate.getTime();
    let commentTotal = 0;

    const addComments = async (nodes, parent, depth) => {
      for (const node of nodes) {
        clock += rand(15, 360) * 60 * 1000;
        const commenter = users[node.by];
        if (!commenter) throw new Error(`Unknown commenter "${node.by}" in "${p.title}"`);

        const comment = await Comment.create({
          content: node.text,
          author: commenter._id,
          post: post._id,
          parentComment: parent ? parent._id : null,
          depth,
        });
        await setDates(Comment, comment._id, new Date(clock));
        if (parent) {
          await Comment.updateOne({ _id: parent._id }, { $inc: { repliesCount: 1 } }, { timestamps: false });
        }

        commentTotal++;
        stats.comments++;
        bump(commenter, 'commentsCount', 1);
        bump(commenter, 'experience', 5);

        await addLikes(Comment, 'Comment', comment, commenter);

        if (node.replies && node.replies.length) {
          await addComments(node.replies, comment, depth + 1);
        }
      }
    };

    await addComments(p.comments || [], null, 0);

    await addLikes(Post, 'Post', post, author);
    await setDates(Post, post._id, postDate, {
      commentsCount: commentTotal,
      lastActivityAt: new Date(clock),
    });
  }

  /* ----- apply counters + levels ----- */
  for (const [id, d] of deltas) {
    await User.updateOne({ _id: id }, { $inc: d }, { timestamps: false });
  }
  for (const u of demoUserList) {
    const fresh = await User.findById(u._id).select('experience');
    await User.updateOne(
      { _id: u._id },
      { $set: { level: levelFromXp(fresh.experience) } },
      { timestamps: false }
    );
  }

  /* ----- summary ----- */
  console.log('Done.\n');
  console.log(`  New demo users : ${stats.users}`);
  console.log(`  New games      : ${stats.games}`);
  console.log(`  New posts      : ${stats.posts}  (already existed: ${stats.skippedPosts})`);
  console.log(`  New comments   : ${stats.comments}`);
  console.log(`  New likes      : ${stats.likes}`);
  console.log('\nDemo login you can share:');
  console.log(`  Email   : ${DEMO_LOGIN_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
};

run()
  .catch((error) => {
    console.error('\nSeeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
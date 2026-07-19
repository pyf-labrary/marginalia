const PATHS = {
  hero: 'assets/art/hero.png',
  moth: 'assets/art/moth.png',
  moonblossom: 'assets/art/moonblossom.png',
  shrine: 'assets/art/shrine.png',
  shrineLit: 'assets/art/shrine_lit.png',
  tree: 'assets/art/tree.png',
  grass: 'assets/tiles/grass.png',
  path: 'assets/tiles/path.png',
  panel: 'assets/ui/panel.png',
  iconBlossom: 'assets/ui/icon_blossom.png',
  iconHeart: 'assets/ui/icon_heart.png',
  iconLantern: 'assets/ui/icon_lantern.png',
  iconMoon: 'assets/ui/icon_moon.png',
  keyart: 'assets/keyart.jpg',
  walk: [
    'assets/anim/walk/w00.png',
    'assets/anim/walk/w01.png',
    'assets/anim/walk/w02.png',
    'assets/anim/walk/w03.png',
    'assets/anim/walk/w04.png',
    'assets/anim/walk/w05.png',
    'assets/anim/walk/w06.png',
    'assets/anim/walk/w07.png'
  ]
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('missing asset', src);
      resolve(null);
    };
    img.src = src;
  });
}

export async function preloadMedia(onProgress) {
  const entries = [];
  for (const [k, v] of Object.entries(PATHS)) {
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) entries.push([`walk${i}`, v[i]]);
    } else {
      entries.push([k, v]);
    }
  }
  const media = { walk: [] };
  let done = 0;
  await Promise.all(
    entries.map(async ([key, src]) => {
      const img = await loadImage(src);
      if (key.startsWith('walk')) {
        media.walk[Number(key.slice(4))] = img;
      } else {
        media[key] = img;
      }
      done++;
      onProgress?.(done, entries.length);
    })
  );
  media.walk = media.walk.filter(Boolean);
  return media;
}

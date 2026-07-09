export const MEDIA = {
  keyart: 'assets/keyart.jpg',
  music: 'assets/bgm_loop.mp3',
  visionCore: 'assets/vision_core.mp4',
  art: {
    seafloor: 'assets/art/seafloor_tile.jpg',
    sub: 'assets/art/submersible.png',
    rocks: ['assets/art/rock.png', 'assets/art/rock-2.png', 'assets/art/rock-3.png'],
    kelp: ['assets/art/kelp.png', 'assets/art/kelp-2.png', 'assets/art/kelp-3.png'],
    fish: ['assets/art/fish.png', 'assets/art/fish-2.png'],
    core: 'assets/art/core.png',
    relic: 'assets/art/relic.png',
    oxygen: 'assets/art/oxygen.png',
    repair: 'assets/art/repair.png',
    predator: 'assets/art/predator.png',
    leviathan: 'assets/art/leviathan.png',
    atlas: {
      pearl: 'assets/art/atlas/pearl-cache.png',
      tablet: 'assets/art/atlas/data-tablet.png',
      crystal: 'assets/art/atlas/aurora-crystal.png',
      blackbox: 'assets/art/atlas/blackbox.png',
      battery: 'assets/art/atlas/battery.png',
      coolant: 'assets/art/atlas/coolant.png',
      silent: 'assets/art/atlas/silent-coil.png',
      decoy: 'assets/art/atlas/flare-decoy.png',
      mine: 'assets/art/atlas/sea-mine.png',
      current: 'assets/art/atlas/rift-current.png',
      brine: 'assets/art/atlas/brine-vent.png',
      crack: 'assets/art/atlas/pressure-crack.png',
      jellyfish: 'assets/art/atlas/jellyfish.png',
      eel: 'assets/art/atlas/lantern-eel.png',
      crab: 'assets/art/atlas/crab-crawler.png',
      manta: 'assets/art/atlas/manta-scout.png',
      wreck: 'assets/art/atlas/wreck-arch.png',
      column: 'assets/art/atlas/ruined-column.png',
      gate: 'assets/art/atlas/coral-gate.png',
      crate: 'assets/art/atlas/salvage-crate.png',
      relay: 'assets/art/atlas/relay-beacon.png',
      buoy: 'assets/art/atlas/sonar-buoy.png',
      anchor: 'assets/art/atlas/mag-anchor.png',
      hatch: 'assets/art/atlas/ancient-hatch.png'
    }
  },
  sfx: {
    ping: 'assets/sfx/ping.mp3',
    pickup: 'assets/sfx/pickup.mp3',
    hull: 'assets/sfx/hull.mp3',
    leviathan: 'assets/sfx/leviathan.mp3',
    dock: 'assets/sfx/dock.mp3',
    warning: 'assets/sfx/warning.mp3'
  }
};

async function exists(url) {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.blob();
  } catch {
    return null;
  }
}

async function loadImageFromUrl(url) {
  const blob = await exists(url);
  if (!blob) return null;
  const objUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = 'async';
  image.src = objUrl;
  try {
    await image.decode();
    return image;
  } catch {
    URL.revokeObjectURL(objUrl);
    return null;
  }
}

function setNested(out, path, value) {
  let cur = out;
  for (let i = 0; i < path.length - 1; i++) {
    cur[path[i]] ||= {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

function artJobs(out, tick) {
  const jobs = [];
  const add = (path, url) => {
    jobs.push(loadImageFromUrl(url).then((img) => {
      if (img) setNested(out.images, path, img);
      tick(`art:${path.join('.')}`);
    }).catch(() => tick(`art:${path.join('.')}`)));
  };
  add(['seafloor'], MEDIA.art.seafloor);
  add(['sub'], MEDIA.art.sub);
  MEDIA.art.rocks.forEach((url, i) => add(['rocks', i], url));
  MEDIA.art.kelp.forEach((url, i) => add(['kelp', i], url));
  MEDIA.art.fish.forEach((url, i) => add(['fish', i], url));
  add(['core'], MEDIA.art.core);
  add(['relic'], MEDIA.art.relic);
  add(['oxygen'], MEDIA.art.oxygen);
  add(['repair'], MEDIA.art.repair);
  add(['predator'], MEDIA.art.predator);
  add(['leviathan'], MEDIA.art.leviathan);
  Object.entries(MEDIA.art.atlas).forEach(([key, url]) => add([key], url));
  return jobs;
}

export async function preloadMedia(onProgress = () => {}) {
  const out = { keyartUrl: '', musicBytes: null, videos: {}, sfxBytes: {}, images: {} };
  let done = 0;
  const jobs = [];
  const tick = (label) => {
    done += 1;
    onProgress(done, jobs.length, label);
  };

  jobs.push(exists(MEDIA.keyart).then((blob) => {
    if (blob) {
      out.keyartUrl = URL.createObjectURL(blob);
      document.documentElement.style.setProperty('--keyart', `url("${out.keyartUrl}")`);
    }
    tick('key art');
  }));

  jobs.push(fetch(MEDIA.music).then((r) => r.ok ? r.arrayBuffer() : null)
    .then((buf) => { out.musicBytes = buf; tick('music'); })
    .catch(() => tick('music')));

  jobs.push(exists(MEDIA.visionCore).then((blob) => {
    if (blob) out.videos.core = URL.createObjectURL(blob);
    tick('vision');
  }));

  Object.entries(MEDIA.sfx).forEach(([key, url]) => {
    jobs.push(fetch(url).then((r) => r.ok ? r.arrayBuffer() : null)
      .then((buf) => { if (buf) out.sfxBytes[key] = buf; tick(`sfx:${key}`); })
      .catch(() => tick(`sfx:${key}`)));
  });

  jobs.push(...artJobs(out, tick));

  await Promise.all(jobs);
  return out;
}

// AETHER — main entry. Boots Three.js, builds the world, drives the loop.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';

import { SkyShader } from './shaders.js';
import { buildWorld, PALETTE } from './world.js';
import { Spirit } from './player.js';
import { AetherAudio } from './audio.js';

// Camera tracking state — smoothed look target eliminates feedback wobble.
const camSmooth = {
  lookTarget: new THREE.Vector3(),
  forward:    new THREE.Vector3(0, 0, -1),
  initialized: false,
};

const state = {
  started: false,
  finale: false,
  revived: 0,
  totalMonoliths: 0,
  collected: 0,
  energy: 0,                // 0..max for revive
  energyMax: 4,
  hint: null,
  finaleT: 0,
  autopilot: false,
};

let scene, camera, renderer, composer, clock;
let sky, skyMat;
let spirit;
let world;
let bloomPass;
let audio = new AetherAudio();
const keys = {};
const mouse = { x: 0, y: 0 };
const tmpV = new THREE.Vector3();

const ui = {
  title:    document.getElementById('title'),
  hud:      document.getElementById('hud'),
  energy:   document.getElementById('energy-fill'),
  counter:  document.getElementById('mono-counter'),
  hint:     document.getElementById('hint'),
  finale:   document.getElementById('finale'),
  start:    document.getElementById('start-btn'),
  marker:   document.getElementById('marker'),
  markerLabel: document.getElementById('marker-label'),
  markerDist:  document.getElementById('marker-dist'),
  pause:    document.getElementById('pause'),
};

init();

// Expose internals for debugging from the console.
window.__aether = () => ({ state, spirit, world, pickAutopilotTarget, computeAutopilotSteer });


function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('app').appendChild(renderer.domElement);

  // Scene + fog
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color('#0a0a1f'), 0.0042);

  // Camera
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 12, 50);

  // Sky dome
  const skyGeo = new THREE.SphereGeometry(500, 32, 16);
  skyMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
    vertexShader: SkyShader.vertexShader,
    fragmentShader: SkyShader.fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });
  skyMat.uniforms.topColor.value    = new THREE.Color('#070718');
  skyMat.uniforms.midColor.value    = new THREE.Color('#1a1240');
  skyMat.uniforms.bottomColor.value = new THREE.Color('#2c1a55');
  sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Soft hemi + a key directional for shading the islands
  const hemi = new THREE.HemisphereLight('#9a86ff', '#1a0e30', 0.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#cbb8ff', 0.6);
  key.position.set(40, 80, 20);
  scene.add(key);

  // World
  world = buildWorld(scene, 90211);
  state.totalMonoliths = world.monoliths.length;

  // Player
  spirit = new Spirit(scene);
  spirit.setKeys(keys);

  // Restore saved progress (if any). Adjusts state.energy, mote/monolith
  // visibility, and spirit pose. May also set state.finale = true.
  const hadSave = loadProgress();
  if (hadSave) {
    // Reflect restored monoliths visually: their reviveProgress was set to 1,
    // so the per-frame lerp in animate() will hold them at fully revived.
    // Force-set materials now so they look right from frame 0.
    for (const m of world.monoliths) {
      if (m.userData.revived) {
        m.userData.glyphMat.uniforms.intensity.value = 2.4;
        m.userData.beamMat.uniforms.intensity.value = 0.9;
        m.userData.mat.emissiveIntensity = 0.95;
        if (m.userData.islandRef && m.userData.islandRef.userData.baseMat) {
          m.userData.islandRef.userData.baseMat.uniforms.revive.value = 1;
        }
      }
    }
    updateHUD();
  }
  state.hadSave = hadSave;
  // If they previously completed the game, restyle the title to offer Continue.
  if (hadSave && state.revived === state.totalMonoliths) {
    document.querySelector('#title .tagline').textContent = "The dawn waits where you left it.";
    document.querySelector('#title .howto').style.display = 'none';
    document.getElementById('start-btn').textContent = 'Continue to Dawn';
    state.skipToFinale = true;
  } else if (hadSave && (state.collected > 0 || state.revived > 0)) {
    // Mid-game save — show a soft "continue" hint
    document.querySelector('#title .tagline').textContent =
      `Continuing — ${state.revived} of ${state.totalMonoliths} monoliths revived.`;
    document.getElementById('start-btn').textContent = 'Continue';
  }

  // Post-processing — bloom is the secret sauce
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.95, 0.85, 0.18);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  clock = new THREE.Clock();

  // Events
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    // Toggle pause on Escape or P (only after game has started).
    if ((e.code === 'Escape' || e.code === 'KeyP') && state.started && !state.finale) {
      e.preventDefault();
      togglePause();
    }
    // Toggle autopilot on A.
    if (e.code === 'KeyA' && state.started && !state.finale && !state.paused) {
      e.preventDefault();
      toggleAutopilot();
    }
  });
  window.addEventListener('keyup',   e => { keys[e.code] = false; });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  // Auto-pause when tab loses focus.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.started && !state.paused && !state.finale) togglePause();
  });

  ui.start.addEventListener('click', startGame);
  document.getElementById('resume-btn').addEventListener('click', () => { if (state.paused) togglePause(); });
  document.getElementById('quit-btn').addEventListener('click', () => {
    saveProgress();
    location.reload();
  });
  document.getElementById('autopilot-btn').addEventListener('click', toggleAutopilot);

  updateHUD();
  animate();

  // Auto-save every 10 seconds so mid-flight position is preserved.
  setInterval(() => { if (state.started && !state.freeFly && !state.restarting) saveProgress(); }, 10000);
  window.addEventListener('beforeunload', () => {
    if (state.started && !state.restarting) saveProgress();
  });
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloomPass.setSize(innerWidth, innerHeight);
}

function onMouseMove(e) {
  // Smaller deadzone in center, gentle falloff
  const nx = (e.clientX / innerWidth)  * 2 - 1;
  const ny = (e.clientY / innerHeight) * 2 - 1;
  mouse.x = nx;
  mouse.y = ny;
}

function onTouchMove(e) {
  if (e.touches.length === 0) return;
  const t = e.touches[0];
  mouse.x = (t.clientX / innerWidth)  * 2 - 1;
  mouse.y = (t.clientY / innerHeight) * 2 - 1;
}

async function startGame() {
  if (state.started) return;
  state.started = true;
  ui.title.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  await audio.start();
  audio.setIntensity(Math.min(1, state.revived / state.totalMonoliths));

  if (state.skipToFinale) {
    // Jump straight into the finale state with full dawn already in effect.
    state.finale = true;
    state.finaleT = 14;       // already past the warming phase
    skyMat.uniforms.horizonGlow.value = 1;
    skyMat.uniforms.bottomColor.value.set('#5a3a82');
    skyMat.uniforms.midColor.value.set('#2a1e58');
    scene.fog.color.set('#231546');
    renderer.toneMappingExposure = 1.5;
    triggerFinale();
    // Immediately reveal the finale overlay (no fade-up delay this time).
    setTimeout(() => ui.finale.classList.add('show'), 600);
    return;
  }

  if (state.hadSave) {
    showHint("Continuing where you left off.", 4);
  } else {
    showHint("Fly to the glowing motes ahead — they will charge your light.", 6);
  }
}

function showHint(text, secs = 4) {
  ui.hint.textContent = text;
  ui.hint.classList.add('show');
  if (state.hint) clearTimeout(state.hint);
  state.hint = setTimeout(() => ui.hint.classList.remove('show'), secs * 1000);
}

function updateHUD() {
  ui.counter.textContent = `${state.revived} / ${state.totalMonoliths}`;
  ui.energy.style.width = `${(state.energy / state.energyMax) * 100}%`;
}

function toggleAutopilot() {
  state.autopilot = !state.autopilot;
  const btn = document.getElementById('autopilot-btn');
  if (state.autopilot) {
    btn.classList.add('on');
    showHint("Autopilot engaged — sit back and breathe.", 4);
  } else {
    btn.classList.remove('on');
    showHint("You have the helm.", 3);
  }
}

// AI: pick the current target the autopilot should fly toward.
function pickAutopilotTarget() {
  // If energy full, head for nearest unrevived monolith. Otherwise, mote.
  let best = null;
  let bestD = Infinity;
  if (state.energy >= state.energyMax) {
    for (const m of world.monoliths) {
      if (m.userData.revived) continue;
      const d = m.position.distanceToSquared(spirit.position);
      if (d < bestD) { bestD = d; best = m; }
    }
  } else {
    for (const m of world.motes) {
      if (m.userData.collected) continue;
      const d = m.position.distanceToSquared(spirit.position);
      if (d < bestD) { bestD = d; best = m; }
    }
  }
  return best;
}

// Compute desired steering inputs to fly toward a world-space target.
// Returns {x, y} in roughly [-1..1] mouse-equivalent space.
function computeAutopilotSteer(targetPos) {
  // Direction we need to face (world)
  const toTarget = new THREE.Vector3().subVectors(targetPos, spirit.position);
  if (toTarget.lengthSq() < 1e-3) return { x: 0, y: 0 };
  toTarget.normalize();

  // Decompose into yaw error (around world up) and pitch error (around right).
  const fwd = spirit.forward.clone();
  // Yaw: angle in XZ plane between fwd and toTarget
  const fXZ = new THREE.Vector2(fwd.x, fwd.z).normalize();
  const tXZ = new THREE.Vector2(toTarget.x, toTarget.z).normalize();
  // Signed angle in XZ (positive = need to turn right)
  let yawErr = Math.atan2(
    fXZ.x * tXZ.y - fXZ.y * tXZ.x,
    fXZ.x * tXZ.x + fXZ.y * tXZ.y
  );
  // Pitch: difference in y angle
  const fPitch = Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1));
  const tPitch = Math.asin(THREE.MathUtils.clamp(toTarget.y, -1, 1));
  const pitchErr = tPitch - fPitch;

  // Convert errors into virtual mouse positions. The deadzone in setMouseTarget
  // is ~0.08; we want to comfortably clear it for visible errors but not
  // saturate for small ones. Scale + clamp.
  const sx = THREE.MathUtils.clamp(-yawErr * 0.9, -0.85, 0.85);
  const sy = THREE.MathUtils.clamp(-pitchErr * 0.9, -0.75, 0.75);
  return { x: sx, y: sy };
}

function togglePause() {
  state.paused = !state.paused;
  if (state.paused) {
    ui.pause.classList.add('show');
    // Dim audio while paused
    if (audio.master) {
      audio._prePauseGain = audio.master.gain.value;
      audio.master.gain.setTargetAtTime(0.05, audio.ctx.currentTime, 0.4);
    }
    saveProgress();
  } else {
    ui.pause.classList.remove('show');
    if (audio.master && audio._prePauseGain != null) {
      audio.master.gain.setTargetAtTime(audio._prePauseGain, audio.ctx.currentTime, 0.5);
    }
    // Reset clock to avoid a huge dt-jump on resume.
    clock.getDelta();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const rawDt = clock.getDelta();

  // When paused, just re-render the current frame so the scene stays live-ish
  // (sky shader/dust animations are visually frozen since we don't advance time).
  if (state.paused) {
    composer.render();
    return;
  }

  const dt = Math.min(0.05, rawDt);
  const t = clock.elapsedTime;

  // Update sky time
  skyMat.uniforms.time.value = t;

  // World drift — sample bob from base, not cumulative. Amplitude kept
  // small so islands feel like they're suspended, not lurching.
  for (const isl of world.islands) {
    isl.position.y = isl.userData.baseY + Math.sin(t * 0.35 + isl.userData.bobPhase) * isl.userData.bobAmp * 0.6;
    isl.rotation.y += dt * 0.012;
  }
  for (const m of world.monoliths) {
    const isl = m.userData.islandRef;
    if (isl) {
      m.position.y = m.userData.baseY + (isl.position.y - isl.userData.baseY);
    }
  }
  world.dust.rotation.y += dt * 0.005;

  // Motes bob + drift
  for (const m of world.motes) {
    if (m.userData.collected) continue;
    m.position.y += Math.sin(t * 0.8 + m.userData.bobPhase) * m.userData.bobAmp * dt;
    const a = m.userData.driftAxis;
    m.position.x += a.x * dt * 0.4;
    m.position.z += a.z * dt * 0.4;
    // Halo billboard
    m.userData.halo.quaternion.copy(camera.quaternion);
    // Pulse
    const pulse = 1.3 + 0.25 * Math.sin(t * 2.5 + m.userData.bobPhase * 3);
    m.userData.haloMat.uniforms.intensity.value = pulse;
    m.userData.core.scale.setScalar(0.9 + 0.15 * Math.sin(t * 3 + m.userData.bobPhase));
  }

  // Player
  if (state.started && !state.finale) {
    if (state.autopilot) {
      const target = pickAutopilotTarget();
      if (target) {
        // Direct steering: slerp the forward vector toward the target.
        // This is far more robust than emulating mouse input — no
        // deadzone, no smoothing, no turn-rate limit fighting us.
        const toTarget = new THREE.Vector3()
          .subVectors(target.position, spirit.position)
          .normalize();
        const dist = target.position.distanceTo(spirit.position);

        // Turn rate scales with distance — sharper turns when close.
        const turn = dist > 60 ? 1.8 : (dist > 20 ? 3.0 : 5.0);
        const k = 1 - Math.exp(-dt * turn);
        spirit.forward.lerp(toTarget, k).normalize();

        // Clamp pitch so the orb doesn't flip.
        const pitch = Math.asin(THREE.MathUtils.clamp(spirit.forward.y, -1, 1));
        const maxP = Math.PI * 0.42;
        if (Math.abs(pitch) > maxP) {
          const flat = new THREE.Vector3(spirit.forward.x, 0, spirit.forward.z);
          if (flat.lengthSq() < 1e-6) flat.set(0, 0, -1);
          flat.normalize();
          const tgtP = Math.sign(pitch) * maxP;
          spirit.forward.set(flat.x * Math.cos(tgtP), Math.sin(tgtP), flat.z * Math.cos(tgtP));
        }

        // Speed: boost when far, normal when mid, slow when very close.
        keys.Space     = dist > 30;
        keys.ShiftLeft = dist < 10;
        keys.KeyW = false; keys.KeyS = false;

        // Roll visual feedback — bank toward target horizontally.
        const right = new THREE.Vector3().crossVectors(spirit.forward, new THREE.Vector3(0,1,0)).normalize();
        const sideErr = -toTarget.dot(right);   // negative when target is to the right
        spirit.roll += (sideErr * 0.6 - spirit.roll) * Math.min(1, dt * 2);

        // Reset mouse steering so it doesn't fight us if user disengages.
        spirit.steerX = 0; spirit.steerY = 0;
        spirit.smoothSteerX = 0; spirit.smoothSteerY = 0;

        // Still need to call update() for movement + speed lerp + trail —
        // but bypass its steering by zeroing inputs (done above).
      } else {
        spirit.setMouseTarget(Math.sin(t * 0.2) * 0.1, -0.05);
        keys.Space = false; keys.ShiftLeft = false;
      }
    } else {
      spirit.setMouseTarget(mouse.x, mouse.y);
    }
    spirit.update(dt);
    spirit.faceCamera(camera);
  } else if (!state.started) {
    // gentle drift while on title screen
    spirit.setMouseTarget(Math.sin(t * 0.2) * 0.15, -0.05);
    spirit.update(dt);
    spirit.faceCamera(camera);
  } else {
    // Finale — bypass normal flight. Spirit orbits the sun cinematically.
    const tgt = state.sunTarget || new THREE.Vector3(0, 60, 0);
    const ascentT = Math.min(1, state.finaleT / 8);
    // Spirit spirals up toward sun, ending in a small orbit near it.
    const orbitAng = state.finaleT * 0.45;
    const orbitR = 18 - ascentT * 8;
    const orbitH = -10 + ascentT * 20;     // rises from below to near the sun
    const desiredPos = new THREE.Vector3(
      tgt.x + Math.cos(orbitAng) * orbitR,
      tgt.y + orbitH,
      tgt.z + Math.sin(orbitAng) * orbitR,
    );
    spirit.position.lerp(desiredPos, Math.min(1, dt * 1.2));
    // Forward = tangent to the orbit, for trail direction
    spirit.forward.set(-Math.sin(orbitAng), 0.1, Math.cos(orbitAng)).normalize();
    // Reset steering inputs so smoothSteer doesn't drift the orb sideways.
    spirit.steerX = 0; spirit.steerY = 0;
    spirit.update(dt);
    spirit.faceCamera(camera);
    // Dim the spirit during finale — the sun is the star of the show, not us.
    // Override the halo intensities that update() just set.
    spirit.haloMat.uniforms.intensity.value  = 0.35;
    spirit.halo2Mat.uniforms.intensity.value = 0.15;
    spirit.light.intensity = 1.2;
    spirit.halo.scale.setScalar(0.5);
    spirit.halo2.scale.setScalar(0.5);
  }

  // Camera follow — chase position behind & above spirit (skipped during finale,
  // which controls the camera itself).
  if (!state.finale) followCamera(dt);

  // Edge-of-world feedback — vignette darkens as the spirit nears the boundary.
  if (!state.finale) {
    const edge = spirit.edgeProximity || 0;
    const vig = document.getElementById('vignette');
    if (edge > 0.05) vig.classList.add('at-edge');
    else             vig.classList.remove('at-edge');
  }

  // Collisions
  if (state.started) checkCollisions(dt);

  // Monolith revive progress + beams
  for (const m of world.monoliths) {
    const target = m.userData.revived ? 1 : 0;
    m.userData.reviveProgress += (target - m.userData.reviveProgress) * Math.min(1, dt * 1.4);
    const p = m.userData.reviveProgress;
    m.userData.glyphMat.uniforms.intensity.value = p * 2.4;
    m.userData.beamMat.uniforms.intensity.value = p * 0.9;
    m.userData.mat.emissiveIntensity = 0.05 + p * 0.9;
    if (m.userData.islandRef && m.userData.islandRef.userData.baseMat) {
      m.userData.islandRef.userData.baseMat.uniforms.revive.value = p;
    }
    m.rotation.y += dt * 0.05 * p;
  }

  // Finale spectacle
  if (state.finale) {
    state.finaleT += dt;
    const fT = Math.min(1, state.finaleT / 12);
    skyMat.uniforms.horizonGlow.value = Math.min(0.85, fT * 0.9);
    skyMat.uniforms.bottomColor.value.lerpColors(new THREE.Color('#2c1a55'), new THREE.Color('#9c5e6e'), fT);
    skyMat.uniforms.midColor.value.lerpColors(new THREE.Color('#1a1240'),    new THREE.Color('#3a2862'), fT);
    skyMat.uniforms.topColor.value.lerpColors(new THREE.Color('#070718'),    new THREE.Color('#1d1538'), fT * 0.7);
    scene.fog.color.lerpColors(new THREE.Color('#0a0a1f'), new THREE.Color('#2a1838'), fT);
    if (fT > 0.25 && !ui.finale.classList.contains('show')) {
      ui.finale.classList.add('show');
    }
    renderer.toneMappingExposure = 1.1 + fT * 0.5;

    // Animate the rising sun
    if (finaleSun && state.sunTarget && state.sunStart) {
      const sunT = Math.min(1, state.finaleT / 9);
      const eased = 1 - Math.pow(1 - sunT, 3);
      finaleSun.position.lerpVectors(state.sunStart, state.sunTarget, eased);
      // Pulse the halos
      const corePulse = 1 + 0.04 * Math.sin(t * 1.5);
      finaleSun.userData.core.scale.setScalar(corePulse * (0.4 + sunT * 0.8));
      for (const child of finaleSun.children) {
        if (child.userData && child.userData.isHalo) {
          child.quaternion.copy(camera.quaternion);
          // Halos swell as sun rises
          const baseScale = 0.5 + sunT * 0.9;
          child.scale.setScalar(baseScale * (1 + 0.03 * Math.sin(t * 0.8 + child.id)));
        }
      }
    }

    // Brighten monolith beams to full — they shoot straight up, toward the
    // rising sun (which sits directly above the cluster center).
    for (const m of world.monoliths) {
      if (m.userData.beamMat) {
        m.userData.beamMat.uniforms.intensity.value = Math.min(1.8, 1 + fT * 1.5);
      }
    }

    // Advance light shower
    if (lightShower) {
      lightShower.material.uniforms.time.value += dt;
      // anchor lerps with the sun
      lightShower.material.uniforms.anchor.value.copy(finaleSun.position);
    }

    // Cinematic camera: slow orbit at island altitude, looking up at the sun.
    const orbit = state.finaleT * 0.1;
    const camR = 60 + Math.min(1, state.finaleT / 10) * 50;
    const tgt  = state.sunTarget || new THREE.Vector3(0, 60, 0);
    const desired = new THREE.Vector3(
      tgt.x + Math.cos(orbit) * camR,
      tgt.y - 60,        // camera well below sun; sun rises into the upper frame
      tgt.z + Math.sin(orbit) * camR,
    );
    camera.position.lerp(desired, Math.min(1, dt * 0.7));
    // Look at a point slightly below the sun so it sits in the upper third
    const lookAt = new THREE.Vector3(tgt.x, tgt.y - 12, tgt.z);
    camera.lookAt(lookAt);

    // Bloom modulates with phase — punch up the moment text appears
    const bloomCurve = 0.95 + 0.5 * Math.sin(Math.min(Math.PI, fT * Math.PI));
    bloomPass.strength = bloomCurve;
  }

  // Objective marker — point at current target
  if (state.started && !state.finale) updateMarker();

  composer.render();
}

// Project world position to screen and position the marker DOM.
function updateMarker() {
  let target = null;
  let mode = 'mote';
  if (state.energy >= state.energyMax) {
    // Aim at nearest unrevived monolith
    let bestD = Infinity;
    for (const m of world.monoliths) {
      if (m.userData.revived) continue;
      const d = m.position.distanceToSquared(spirit.position);
      if (d < bestD) { bestD = d; target = m; }
    }
    mode = 'monolith';
  } else {
    // Aim at nearest uncollected mote
    let bestD = Infinity;
    for (const m of world.motes) {
      if (m.userData.collected) continue;
      const d = m.position.distanceToSquared(spirit.position);
      if (d < bestD) { bestD = d; target = m; }
    }
    mode = 'mote';
  }

  if (!target) { ui.marker.classList.add('hidden'); return; }

  const p = target.position.clone();
  // Offset upward for monoliths so marker sits above the prism
  if (mode === 'monolith') p.y += (target.userData.height || 14) + 4;

  const v = p.project(camera);
  const behind = v.z > 1;
  let sx = ( v.x * 0.5 + 0.5) * innerWidth;
  let sy = (-v.y * 0.5 + 0.5) * innerHeight;

  // Off-screen / behind: clamp to viewport edge in correct direction.
  let offscreen = false;
  const pad = 60;
  if (behind || v.x < -1 || v.x > 1 || v.y < -1 || v.y > 1) {
    offscreen = true;
    // Compute direction from screen center to target in NDC, flipping if behind.
    let dx = v.x, dy = -v.y;
    if (behind) { dx = -dx; dy = -dy; }
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const halfW = cx - pad, halfH = cy - pad;
    // Scale to reach the nearer edge
    const scale = Math.min(halfW / Math.abs(dx || 0.0001), halfH / Math.abs(dy || 0.0001));
    sx = cx + dx * scale;
    sy = cy + dy * scale;
  }

  ui.marker.classList.remove('hidden');
  ui.marker.classList.toggle('offscreen', offscreen);
  ui.marker.classList.toggle('target-monolith', mode === 'monolith');
  ui.marker.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
  ui.markerLabel.textContent = mode === 'monolith' ? 'Monolith' : 'Starlight';
  const dist = target.position.distanceTo(spirit.position);
  ui.markerDist.textContent = `${Math.round(dist)}m`;
}

function followCamera(dt) {
  // Stable chase camera: lerp position only; lookAt the spirit itself
  // (no "look-ahead" — that's what caused the feedback wobble).
  if (!camSmooth.initialized) {
    camSmooth.forward.copy(spirit.forward);
    camSmooth.initialized = true;
  }
  // Very heavily smoothed forward — camera basically tracks where the spirit
  // has been heading on average, not where it is now.
  const fwdK = 1 - Math.exp(-dt * 1.8);
  camSmooth.forward.lerp(spirit.forward, fwdK).normalize();

  const back = tmpV.copy(camSmooth.forward).multiplyScalar(-9);
  const desired = new THREE.Vector3().copy(spirit.position).add(back);
  desired.y += 2.6;

  const posK = 1 - Math.exp(-dt * 2.2);
  camera.position.lerp(desired, posK);
  camera.lookAt(spirit.position);
}

function checkCollisions(dt) {
  // Motes
  for (const m of world.motes) {
    if (m.userData.collected) continue;
    const dx = spirit.position.x - m.position.x;
    const dy = spirit.position.y - m.position.y;
    const dz = spirit.position.z - m.position.z;
    const d2 = dx*dx + dy*dy + dz*dz;
    // Wide attractor radius — motes feel pulled to the spirit.
    if (d2 < 256) {
      const d = Math.sqrt(d2);
      // 0 at edge → 1 at center
      const t = 1 - d / 16;
      // Pull speed in m/s. Must exceed top player speed (36) when close so
      // motes can catch up regardless of how fast the spirit is flying.
      const pull = 18 + t * t * 70;
      const step = pull * dt;
      const inv = 1 / Math.max(d, 0.001);
      m.position.x += dx * inv * step;
      m.position.y += dy * inv * step;
      m.position.z += dz * inv * step;
    }
    // Easier collect radius.
    if (d2 < 9) {
      m.userData.collected = true;
      m.visible = false;
      state.collected++;
      state.energy = Math.min(state.energyMax, state.energy + 1);
      audio.chime(state.collected % 8);
      spirit.pulse(0.5);
      audio.setIntensity(Math.min(1, state.revived / state.totalMonoliths + state.collected * 0.002));
      updateHUD();
      saveProgress();
      if (state.collected === 1) showHint("Light gathered. Collect 4 motes to charge fully.", 5);
      if (state.energy === state.energyMax && state.revived === 0)
        showHint("Your light is full. Fly to the nearest monolith — the cyan beam.", 6);
    }
  }

  // Monoliths
  for (const m of world.monoliths) {
    if (m.userData.revived) continue;
    const d2 = m.position.distanceToSquared(spirit.position);
    if (d2 < 280 && state.energy >= state.energyMax) {
      // Within reviving range with full energy — trigger.
      m.userData.revived = true;
      state.revived++;
      state.energy = 0;
      spirit.pulse(1.5);
      audio.bell(170 + Math.random() * 60);
      audio.setIntensity(Math.min(1, state.revived / state.totalMonoliths));
      updateHUD();
      saveProgress();
      if (state.revived === 1)  showHint("Beautiful. Gather more starlight and find another.", 5);
      if (state.revived === Math.floor(state.totalMonoliths / 2)) showHint("Halfway through the long night.", 4);
      if (state.revived === state.totalMonoliths) triggerFinale();
    } else if (d2 < 280 && state.energy < state.energyMax) {
      // Close but not enough energy — soft hint occasionally
      if (!m.userData._hinted) {
        m.userData._hinted = true;
        showHint(`Need ${state.energyMax - state.energy} more starlight before this monolith.`, 4);
        setTimeout(() => m.userData._hinted = false, 8000);
      }
    }
  }
}

// Finale: a "sun" object that rises from where all monolith beams converge.
let finaleSun = null;
function buildFinaleSun() {
  if (finaleSun) return finaleSun;
  const g = new THREE.Group();

  // Bright core sphere
  const coreGeo = new THREE.IcosahedronGeometry(8, 3);
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff2cc') });
  const core = new THREE.Mesh(coreGeo, coreMat);
  g.add(core);

  // Three layered billboards for halo
  for (let i = 0; i < 3; i++) {
    const size = 40 + i * 50;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        color:     { value: new THREE.Color(i === 0 ? '#ffd9a0' : i === 1 ? '#ffb070' : '#ff8848') },
        intensity: { value: 1.2 - i * 0.3 },
        softness:  { value: 2.5 + i * 0.8 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color; uniform float intensity; uniform float softness;
        void main(){
          vec2 p = vUv - 0.5; float d = length(p) * 2.0;
          float a = pow(1.0 - clamp(d, 0.0, 1.0), softness);
          gl_FragColor = vec4(color * intensity * a, a);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.userData.isHalo = true;
    g.add(m);
  }

  g.userData.core = core;
  g.visible = false;
  scene.add(g);
  finaleSun = g;
  return g;
}

function triggerFinale() {
  state.finale = true;
  state.finaleT = 0;
  audio.finale();
  ui.marker.classList.add('hidden');
  // Build the rising sun.
  buildFinaleSun();
  // Sun rises above the average monolith position so converging beams meet there.
  const avg = new THREE.Vector3();
  for (const m of world.monoliths) avg.add(m.position);
  avg.divideScalar(world.monoliths.length || 1);
  state.sunTarget = new THREE.Vector3(avg.x, avg.y + 95, avg.z);
  state.sunStart  = new THREE.Vector3(avg.x, avg.y - 25, avg.z);
  finaleSun.position.copy(state.sunStart);
  finaleSun.visible = true;
  // Build the cascading light shower.
  buildLightShower();
  if (lightShower) lightShower.material.uniforms.anchor.value.copy(state.sunStart);

  // Wire buttons once
  if (!ui._wired) {
    ui._wired = true;
    document.getElementById('free-fly-btn').addEventListener('click', () => {
      ui.finale.classList.remove('show');
      state.finale = false;
      state.freeFly = true;
      bloomPass.strength = 0.95;
      // Restore spirit halo scales (we shrunk them during finale).
      spirit.halo.scale.setScalar(1);
      spirit.halo2.scale.setScalar(1);
      ui.marker.classList.remove('hidden');
    });
    document.getElementById('restart-btn').addEventListener('click', () => {
      // Hard reset: mark intent, wipe save, and reload with ?fresh=1 so even
      // if a late save sneaks in, we still bypass loadProgress on boot.
      state.restarting = true;
      try { localStorage.removeItem('aether.save.v1'); } catch(e) {}
      try { localStorage.setItem('aether.fresh', '1'); } catch(e) {}
      const url = new URL(location.href);
      url.searchParams.set('fresh', String(Date.now()));
      location.replace(url.toString());
    });
  }
  saveProgress();
}

// ── Light shower — golden sparks cascading from the rising sun ────────────
let lightShower = null;
function buildLightShower() {
  if (lightShower) return;
  const count = 900;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * 4;
    positions[i*3]   = Math.cos(ang) * r;
    positions[i*3+1] = Math.random() * 4;
    positions[i*3+2] = Math.sin(ang) * r;
    const speed = 12 + Math.random() * 28;
    velocities[i*3]   = Math.cos(ang) * speed * (0.4 + Math.random()*0.7);
    velocities[i*3+1] = -(1 + Math.random() * 6);
    velocities[i*3+2] = Math.sin(ang) * speed * (0.4 + Math.random()*0.7);
    seeds[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time:   { value: 0 },
      anchor: { value: new THREE.Vector3() },
      ppx:    { value: window.devicePixelRatio || 1 },
    },
    vertexShader: /* glsl */`
      attribute vec3 velocity;
      attribute float seed;
      uniform float time;
      uniform vec3 anchor;
      uniform float ppx;
      varying float vAge;
      void main(){
        float life = 5.0;
        float t = mod(time + seed * life, life);
        vec3 p = position + velocity * t;
        p.y -= 0.5 * 5.5 * t * t;
        float curl = sin(seed * 30.0 + time * 0.5) * 2.0 * t;
        p.x += curl;
        p += anchor;
        vAge = t / life;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(240.0 * ppx / -mv.z * (1.2 - vAge), 1.0, 80.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying float vAge;
      void main(){
        vec2 p = gl_PointCoord - 0.5;
        float d = length(p) * 2.0;
        float a = pow(1.0 - clamp(d, 0.0, 1.0), 2.6) * (1.0 - vAge);
        if (a < 0.01) discard;
        vec3 warm = mix(vec3(1.0, 0.93, 0.72), vec3(1.0, 0.55, 0.30), vAge * 0.7);
        gl_FragColor = vec4(warm * (1.0 + a*0.6), a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  lightShower = new THREE.Points(g, mat);
  lightShower.frustumCulled = false;
  scene.add(lightShower);
}

// ── Save / restore progress ────────────────────────────────────────────────
function saveProgress() {
  try {
    const data = {
      seed: 90211,
      energy: state.energy,
      collected: state.collected,
      revived: state.revived,
      finale: state.finale,
      collectedIds: world.motes.map((m, i) => m.userData.collected ? i : -1).filter(i => i >= 0),
      revivedIds:   world.monoliths.map((m, i) => m.userData.revived ? i : -1).filter(i => i >= 0),
      spirit: { x: spirit.position.x, y: spirit.position.y, z: spirit.position.z,
                fx: spirit.forward.x, fy: spirit.forward.y, fz: spirit.forward.z },
    };
    localStorage.setItem('aether.save.v1', JSON.stringify(data));
  } catch(e) { /* ignore quota / privacy mode */ }
}

function loadProgress() {
  try {
    // Fresh-start flag from a "Begin Again" reload — wipe save & skip load.
    const params = new URLSearchParams(location.search);
    const freshFlagUrl = params.has('fresh');
    const freshFlagLs  = (() => { try { return localStorage.getItem('aether.fresh') === '1'; } catch(e) { return false; } })();
    if (freshFlagUrl || freshFlagLs) {
      try { localStorage.removeItem('aether.save.v1'); } catch(e) {}
      try { localStorage.removeItem('aether.fresh'); } catch(e) {}
      // Clean the URL so a later refresh doesn't keep forcing fresh-start.
      if (freshFlagUrl) {
        const url = new URL(location.href);
        url.searchParams.delete('fresh');
        history.replaceState(null, '', url.toString());
      }
      return false;
    }
    const raw = localStorage.getItem('aether.save.v1');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.seed !== 90211) return false;
    state.energy = data.energy || 0;
    state.collected = data.collected || 0;
    state.revived = data.revived || 0;
    for (const i of (data.collectedIds || [])) {
      const m = world.motes[i];
      if (m) { m.userData.collected = true; m.visible = false; }
    }
    for (const i of (data.revivedIds || [])) {
      const m = world.monoliths[i];
      if (m) {
        m.userData.revived = true;
        m.userData.reviveProgress = 1;
      }
    }
    if (data.spirit) {
      spirit.position.set(data.spirit.x, data.spirit.y, data.spirit.z);
      spirit.forward.set(data.spirit.fx, data.spirit.fy, data.spirit.fz).normalize();
    }
    audio.setIntensity(Math.min(1, state.revived / state.totalMonoliths));
    return true;
  } catch(e) { return false; }
}

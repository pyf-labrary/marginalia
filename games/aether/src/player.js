// The Spirit — player character with flight controls + glow + trail.

import * as THREE from 'three';
import { GlowShader } from './shaders.js';
import { PALETTE } from './world.js';

export class Spirit {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // Core orb
    const coreGeo = new THREE.IcosahedronGeometry(0.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: PALETTE.spirit });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    // Inner glow halo (billboard)
    const haloGeo = new THREE.PlaneGeometry(4, 4);
    this.haloMat = new THREE.ShaderMaterial({
      uniforms: {
        color:     { value: new THREE.Color('#ffd58a') },
        intensity: { value: 1.8 },
        softness:  { value: 2.4 },
      },
      vertexShader: GlowShader.vertexShader,
      fragmentShader: GlowShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.halo = new THREE.Mesh(haloGeo, this.haloMat);
    this.group.add(this.halo);

    // Outer soft halo
    const halo2Geo = new THREE.PlaneGeometry(9, 9);
    this.halo2Mat = new THREE.ShaderMaterial({
      uniforms: {
        color:     { value: new THREE.Color('#ffb060') },
        intensity: { value: 0.7 },
        softness:  { value: 3.2 },
      },
      vertexShader: GlowShader.vertexShader,
      fragmentShader: GlowShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.halo2 = new THREE.Mesh(halo2Geo, this.halo2Mat);
    this.group.add(this.halo2);

    // Point light
    this.light = new THREE.PointLight('#ffc890', 4.5, 60, 1.4);
    this.group.add(this.light);

    // Trail — ribbon of points
    this.trailLen = 90;
    this.trailPositions = new Float32Array(this.trailLen * 3);
    this.trailColors    = new Float32Array(this.trailLen * 3);
    this.trailAlphas    = new Float32Array(this.trailLen);
    this.trailIndex = 0;
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    tg.setAttribute('color',    new THREE.BufferAttribute(this.trailColors, 3));
    tg.setAttribute('alpha',    new THREE.BufferAttribute(this.trailAlphas, 1));
    const tm = new THREE.ShaderMaterial({
      uniforms: { size: { value: 22 * (window.devicePixelRatio || 1) } },
      vertexShader: /* glsl */`
        attribute float alpha;
        varying vec3 vColor;
        varying float vA;
        uniform float size;
        void main(){
          vColor = color;
          vA = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          // Distance-attenuated point size, clamped — keeps the trail stable
          // when points are right next to the camera.
          float d = max(8.0, -mv.z);
          gl_PointSize = clamp(size * (0.6 + vA) * 80.0 / d, 1.0, 90.0);
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        varying float vA;
        void main(){
          vec2 p = gl_PointCoord - 0.5;
          float d = length(p) * 2.0;
          float a = pow(1.0 - clamp(d, 0.0, 1.0), 2.0) * vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor * (1.0 + a*0.4), a);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.trail = new THREE.Points(tg, tm);
    scene.add(this.trail);

    // Movement state — auto-forward; mouse steers; W boost, S slow.
    this.position = this.group.position;
    this.position.set(0, 8, 35);
    this.forward = new THREE.Vector3(0, 0, -1);
    this.up      = new THREE.Vector3(0, 1, 0);
    this.right   = new THREE.Vector3(1, 0, 0);
    this.speed   = 14;
    this.targetSpeed = 14;
    this.minSpeed = 6;
    this.maxSpeed = 36;

    // Mouse-driven yaw/pitch deltas
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    // Smoothed steering input (low-pass on raw mouse to kill jitter)
    this.smoothSteerX = 0;
    this.smoothSteerY = 0;

    // Track total energy / collection feedback
    this.boostPulse = 0;
  }

  setMouseTarget(nx, ny) {
    // nx, ny in [-1..1]. Apply deadzone so the spirit doesn't jitter at rest.
    const dz = 0.08;
    const apply = v => {
      const s = Math.sign(v);
      const m = Math.max(0, Math.abs(v) - dz) / (1 - dz);
      // Soft curve — fine control near center, more aggressive at edges.
      return s * Math.pow(m, 1.4);
    };
    this.steerX = apply(nx);
    this.steerY = apply(ny);
  }

  setKeys(keys) { this.keys = keys; }

  update(dt) {
    const k = this.keys || {};
    // Speed control
    const boost = (k['Space'] || k['KeyW']) ? 1 : 0;
    const slow  = (k['ShiftLeft'] || k['KeyS']) ? 1 : 0;
    this.targetSpeed = 14 + boost * 22 - slow * 8;
    this.targetSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.targetSpeed));
    this.speed += (this.targetSpeed - this.speed) * Math.min(1, dt * 2);

    // Mouse steering — smooth raw input, then apply as angular velocity.
    const rawX = this.steerX || 0;
    const rawY = this.steerY || 0;
    // Heavy low-pass to kill micro-jitter.
    const lerpK = 1 - Math.exp(-dt * 6);
    this.smoothSteerX += (rawX - this.smoothSteerX) * lerpK;
    this.smoothSteerY += (rawY - this.smoothSteerY) * lerpK;
    const sx = this.smoothSteerX;
    const sy = this.smoothSteerY;
    const yawRate   = -sx * 0.85;
    const pitchRate = -sy * 0.6;
    const yawQ   = new THREE.Quaternion().setFromAxisAngle(this.up, yawRate * dt);
    this.forward.applyQuaternion(yawQ);
    const right = new THREE.Vector3().crossVectors(this.forward, this.up).normalize();
    const pitchQ = new THREE.Quaternion().setFromAxisAngle(right, pitchRate * dt);
    this.forward.applyQuaternion(pitchQ);
    // Clamp pitch — prevent flipping.
    const pitchAngle = Math.asin(THREE.MathUtils.clamp(this.forward.y, -1, 1));
    const maxPitch = Math.PI * 0.4;
    if (Math.abs(pitchAngle) > maxPitch) {
      const flat = new THREE.Vector3(this.forward.x, 0, this.forward.z);
      if (flat.lengthSq() < 1e-6) flat.set(0, 0, -1);
      flat.normalize();
      const target = Math.sign(pitchAngle) * maxPitch;
      this.forward.set(flat.x * Math.cos(target), Math.sin(target), flat.z * Math.cos(target));
    }
    this.forward.normalize();

    this.roll += (-sx * 0.35 - this.roll) * Math.min(1, dt * 2.5);

    // Move
    this.position.addScaledVector(this.forward, this.speed * dt);

    // Soft world boundary — sliding curvature, not a pull back.
    // Decompose forward into outward (radial) and tangential (along the
    // boundary circle) components. As we cross softR, the outward part is
    // damped out, so flight curves along the edge — like skimming a horizon.
    // softR pushed out to 450 so the edge effect only kicks in very far out.
    const distXZ = Math.hypot(this.position.x, this.position.z);
    const softR = 450, hardR = 650;
    if (distXZ > softR) {
      const tEdge = Math.min(1, (distXZ - softR) / (hardR - softR));
      const outward = new THREE.Vector3(this.position.x, 0, this.position.z).multiplyScalar(1 / Math.max(distXZ, 1e-3));
      // Project forward onto outward direction (signed radial speed)
      const radial = this.forward.dot(outward);
      if (radial > 0) {
        // Remove some of the outward component — at full tEdge=1, all of it.
        const remove = tEdge * radial;
        this.forward.x -= outward.x * remove;
        this.forward.z -= outward.z * remove;
        this.forward.normalize();
      }
      // Hard cap: if somehow past hardR, clamp position to the circle so we
      // never actually escape, but keep tangential motion intact.
      if (distXZ > hardR) {
        const scale = hardR / distXZ;
        this.position.x *= scale;
        this.position.z *= scale;
      }
      this.edgeProximity = tEdge;
    } else {
      this.edgeProximity = 0;
    }

    // Soft altitude bounds — pushed out so vertical exploration is roomy.
    if (Math.abs(this.position.y) > 160) {
      const tY = Math.min(1, (Math.abs(this.position.y) - 160) / 60);
      this.forward.y += -Math.sign(this.position.y) * tY * dt * 2;
      this.forward.normalize();
    }

    // Don't reorient the spirit group via lookAt — the orb is rotationally
    // symmetric, and rotating it just made the halos wobble. Keep group
    // identity rotation; the trail makes direction obvious anyway.

    // Pulse halo on boost
    this.boostPulse += ((boost ? 1 : 0) - this.boostPulse) * Math.min(1, dt * 4);
    this.haloMat.uniforms.intensity.value = 1.6 + this.boostPulse * 0.8 + Math.sin(performance.now()*0.003)*0.08;
    this.halo2Mat.uniforms.intensity.value = 0.6 + this.boostPulse * 0.5;
    this.light.intensity = 4.5 + this.boostPulse * 2.0;

    // Update trail
    const i = this.trailIndex;
    this.trailPositions[i*3]   = this.position.x;
    this.trailPositions[i*3+1] = this.position.y;
    this.trailPositions[i*3+2] = this.position.z;
    this.trailIndex = (i + 1) % this.trailLen;

    // Recompute colors/alphas by age
    for (let j = 0; j < this.trailLen; j++) {
      let age = (this.trailIndex - 1 - j + this.trailLen) % this.trailLen;
      const t = age / this.trailLen;
      const a = Math.pow(1 - t, 2.2);
      this.trailAlphas[j] = a;
      const c = new THREE.Color().setHSL(0.10 - t*0.18, 0.85, 0.55 - t*0.2);
      this.trailColors[j*3]   = c.r;
      this.trailColors[j*3+1] = c.g;
      this.trailColors[j*3+2] = c.b;
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.geometry.attributes.color.needsUpdate = true;
    this.trail.geometry.attributes.alpha.needsUpdate = true;
  }

  // Billboard halos to camera every frame.
  faceCamera(camera) {
    this.halo.quaternion.copy(camera.quaternion);
    this.halo2.quaternion.copy(camera.quaternion);
  }

  pulse(strength = 1) {
    this.boostPulse = Math.min(2, this.boostPulse + strength);
  }
}

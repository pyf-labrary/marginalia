// Custom shaders for AETHER

export const SkyShader = {
  uniforms: {
    time:        { value: 0 },
    topColor:    { value: null },     // set on init
    midColor:    { value: null },
    bottomColor: { value: null },
    horizonGlow: { value: 0 },        // 0..1 — builds during finale
  },
  vertexShader: /* glsl */`
    varying vec3 vWorldDir;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldDir = normalize(wp.xyz - cameraPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    varying vec3 vWorldDir;
    uniform float time;
    uniform vec3 topColor;
    uniform vec3 midColor;
    uniform vec3 bottomColor;
    uniform float horizonGlow;

    // cheap 3d hash for star points
    float hash13(vec3 p){
      p = fract(p * vec3(443.8975, 397.2973, 491.1871));
      p += dot(p.zxy, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
    }

    void main(){
      vec3 d = normalize(vWorldDir);
      float h = d.y;                       // -1 .. 1
      float t = smoothstep(-0.15, 0.55, h);
      vec3 col = mix(bottomColor, midColor, smoothstep(-0.2, 0.25, h));
      col = mix(col, topColor, smoothstep(0.2, 0.85, h));

      // horizon haze that warms during finale
      float horiz = exp(-abs(h) * 6.0);
      col += horiz * mix(vec3(0.06,0.04,0.10), vec3(0.55,0.30,0.18), horizonGlow) * (0.6 + horizonGlow*1.6);

      // stars — only above horizon, denser high up
      vec3 sp = d * 180.0;
      vec3 ip = floor(sp);
      float r = hash13(ip);
      float starMask = smoothstep(0.9965, 1.0, r);
      float tw = 0.55 + 0.45 * sin(time * 2.0 + r * 80.0);
      float starV = starMask * tw * smoothstep(-0.05, 0.4, h);
      col += vec3(0.85, 0.9, 1.05) * starV * (1.0 - horizonGlow*0.6);

      // brighter rare stars
      float r2 = hash13(ip + 17.3);
      float bigStar = smoothstep(0.9992, 1.0, r2) * (0.6 + 0.4*sin(time*1.2 + r2*40.0));
      col += vec3(1.0, 0.95, 0.85) * bigStar * smoothstep(0.0, 0.5, h);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

// Soft radial glow used for spirit, motes, and beam cores.
export const GlowShader = {
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    varying vec2 vUv;
    uniform vec3 color;
    uniform float intensity;
    uniform float softness;
    void main(){
      vec2 p = vUv - 0.5;
      float d = length(p) * 2.0;
      float a = pow(1.0 - clamp(d, 0.0, 1.0), softness);
      vec3 c = color * intensity * a;
      // hot core
      c += color * smoothstep(0.18, 0.0, d) * intensity * 0.8;
      gl_FragColor = vec4(c, a);
    }
  `,
};

// Crystalline island base — fresnel rim + subtle iridescent palette.
export const CrystalShader = {
  vertexShader: /* glsl */`
    varying vec3 vN;
    varying vec3 vV;
    varying vec3 vP;
    void main(){
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vV = normalize(-mv.xyz);
      vP = position;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */`
    varying vec3 vN;
    varying vec3 vV;
    varying vec3 vP;
    uniform vec3 baseColor;
    uniform vec3 rimColor;
    uniform float rimPower;
    uniform float revive;        // 0..1
    uniform vec3 reviveColor;
    void main(){
      float fres = pow(1.0 - max(dot(vN, vV), 0.0), rimPower);
      vec3 col = baseColor * (0.4 + 0.6 * max(vN.y, 0.0));
      col = mix(col, rimColor, fres);
      // revived shimmer
      float band = 0.5 + 0.5 * sin(vP.y * 2.2 + revive * 8.0);
      col = mix(col, reviveColor, revive * (0.35 + 0.4*band));
      col += reviveColor * revive * fres * 1.4;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

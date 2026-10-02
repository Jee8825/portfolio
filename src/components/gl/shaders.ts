/* Shared GLSL for the neural field. Positions live in a float texture:
 * width TEX_W, `rows` rows per formation, formations stacked vertically. */

const common = /* glsl */ `
  uniform sampler2D uForm;
  uniform float uTexW;
  uniform float uTexH;
  uniform float uRows;
  uniform float uFrom;
  uniform float uTo;
  uniform float uMix;
  uniform vec3 uOffFrom;
  uniform vec3 uOffTo;
  uniform float uSpinFrom;
  uniform float uSpinTo;
  uniform float uTime;
  uniform float uScatter;
  uniform float uFit;
  uniform float uSide;
  uniform vec3 uPointer;
  uniform float uVel;
  uniform float uPulse;

  vec4 formAt(float idx, float f) {
    float x = mod(idx, uTexW);
    float y = floor(idx / uTexW) + f * uRows;
    return texture2D(uForm, (vec2(x, y) + 0.5) / vec2(uTexW, uTexH));
  }

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  float h11(float n) { return fract(sin(n) * 43758.5453123); }

  // returns xyz position, w = ink id after the morph
  vec4 field(float idx, float seed) {
    vec4 a = formAt(idx, uFrom);
    vec4 b = formAt(idx, uTo);
    // staggered per particle so the morph flows instead of snapping
    float m = clamp(uMix * 1.7 - seed * 0.7, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vec3 pa = rotY(a.xyz, uTime * 0.12 * uSpinFrom) + uOffFrom * uSide;
    vec3 pb = rotY(b.xyz, uTime * 0.12 * uSpinTo) + uOffTo * uSide;
    vec3 p = mix(pa, pb, m);
    // particles arc through depth while travelling
    p.z += sin(m * 3.14159) * (seed - 0.5) * 3.5;
    p *= uFit;

    // breathing drift; scroll velocity stirs the field
    float amp = 0.035 + min(abs(uVel), 4.0) * 0.03;
    p += amp * vec3(
      sin(uTime * 0.7 + seed * 40.0),
      cos(uTime * 0.6 + seed * 31.0),
      sin(uTime * 0.5 + seed * 17.0)
    );

    // explosion used by transitions
    vec3 dir = normalize(vec3(h11(seed * 12.9898) - 0.5, h11(seed * 78.233) - 0.5, h11(seed * 37.719) - 0.5) + 1e-4);
    p += dir * uScatter * (3.0 + 9.0 * h11(seed * 93.1));

    // pointer repulsion
    vec2 d = p.xy - uPointer.xy;
    float r = length(d);
    p.xy += normalize(d + 1e-4) * smoothstep(1.5, 0.0, r) * 0.55;

    // signal pulse: a shockwave rolling outward from the centre
    float pr = length(p.xy);
    p.z += uPulse * 0.6 * exp(-pow(pr - uPulse * 7.0, 2.0) * 2.0);

    return vec4(p, m < 0.5 ? a.w : b.w);
  }
`;

export const pointsVert = /* glsl */ `
  ${common}
  attribute float aIdx;
  attribute float aSeed;
  uniform float uSize;
  uniform float uPR;
  uniform float uWorld;
  uniform vec3 uInk0;
  uniform vec3 uInk1;
  uniform vec3 uInk2;
  uniform vec3 uInk3;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec4 f = field(aIdx, aSeed);
    vec4 mv = modelViewMatrix * vec4(f.xyz, 1.0);
    gl_Position = projectionMatrix * mv;

    float ink = f.w;
    vColor = ink < 0.5 ? uInk0 : ink < 1.5 ? uInk1 : ink < 2.5 ? uInk2 : uInk3;

    float size = uSize * (0.65 + 0.7 * h11(aSeed * 7.0));
    vAlpha = 1.0;
    if (uWorld < 0.5) {
      // episodic memories flicker; key points are dimmer phosphor
      if (ink > 0.5 && ink < 1.5) vAlpha = 0.55 + 0.45 * sin(uTime * 5.0 + aSeed * 120.0);
      if (ink < 0.5) vAlpha = 0.85;
    } else {
      // print: plates are slightly mis-registered, dots a bit chunkier
      vec2 reg = ink < 0.5 ? vec2(0.0) : ink < 1.5 ? vec2(0.0035, -0.002) : ink < 2.5 ? vec2(-0.003, 0.0025) : vec2(0.0015, 0.0035);
      gl_Position.xy += reg * gl_Position.w;
      size *= 1.25;
    }
    gl_PointSize = size * uPR * (10.0 / -mv.z);
    vSeed = aSeed;
  }
`;

export const pointsFrag = /* glsl */ `
  uniform float uWorld;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSeed;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (uWorld < 0.5) {
      // phosphor glow: hot core, soft falloff (additive)
      float core = smoothstep(0.24, 0.0, d);
      float halo = pow(smoothstep(0.5, 0.0, d), 2.0) * 0.55;
      float a = (core * 1.5 + halo) * vAlpha;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vColor * a, a);
    } else {
      // ink dot with a rough, absorbed edge (multiply)
      float n = (hash(floor(gl_PointCoord * 9.0) + vSeed) - 0.5) * 0.12;
      float a = 1.0 - smoothstep(0.36 + n, 0.44 + n, d);
      if (a < 0.02) discard;
      gl_FragColor = vec4(mix(vec3(1.0), vColor, a * 0.9), 1.0);
    }
  }
`;

export const linesVert = /* glsl */ `
  ${common}
  attribute float aA;
  attribute float aB;
  attribute float aSA;
  attribute float aSB;
  attribute float aSide;
  attribute float aSeed;
  uniform float uWorld;
  varying float vSide;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec4 pa = field(aA, aSA);
    vec4 pb = field(aB, aSB);
    vec3 p = aSide < 0.5 ? pa.xyz : pb.xyz;
    float len = distance(pa.xyz, pb.xyz);
    // edges only exist where neighbours are actually close in the current shape
    vAlpha = 1.0 - smoothstep(0.18, 0.55, len / max(uFit, 0.001));
    vSide = aSide;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const linesFrag = /* glsl */ `
  uniform float uWorld;
  uniform float uTime;
  uniform vec3 uInk0;
  uniform vec3 uInk2;
  varying float vSide;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    if (vAlpha < 0.01) discard;
    if (uWorld < 0.5) {
      // a synaptic pulse travels along each edge
      float head = fract(uTime * 0.35 + vSeed);
      float pulse = smoothstep(0.12, 0.0, abs(vSide - head));
      vec3 col = mix(uInk2 * 0.35, uInk0, pulse);
      float a = vAlpha * (0.16 + pulse * 0.6);
      gl_FragColor = vec4(col * a, a);
    } else {
      float a = vAlpha * 0.28;
      gl_FragColor = vec4(mix(vec3(1.0), uInk0, a), 1.0);
    }
  }
`;

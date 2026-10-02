import { Effect, EffectAttribute } from "postprocessing";
import { Uniform, Vector2 } from "three";

/* One screen pass that carries the whole "lens" of each world:
 *  digital → CRT curvature, scanlines, phosphor flicker, RGB split, noise, vignette
 *  analog  → paper fibre, soft vignette
 * plus the transition tear (glitch) shared by both. */
const fragment = /* glsl */ `
  uniform float uWorld;
  uniform float uGlitch;
  uniform float uTime;
  uniform float uCA;
  uniform vec2 uRes;

  float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec2 warp(vec2 uv) {
    // CRT barrel, fades out in print
    vec2 c = uv - 0.5;
    float k = 0.035 * (1.0 - uWorld);
    uv = 0.5 + c * (1.0 + k * dot(c, c) * 4.0);
    // horizontal tear bands during transitions
    float band = floor(uv.y * 28.0 + floor(uTime * 24.0) * 7.0);
    float r = rnd(vec2(band, floor(uTime * 24.0)));
    uv.x += (r - 0.5) * 0.22 * uGlitch * step(0.55, r);
    return uv;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv0, out vec4 outputColor) {
    vec2 uv = warp(uv0);
    float split = uCA * (1.0 - uWorld) + uGlitch * 0.02;
    vec2 o = vec2(split, 0.0);
    vec3 col = vec3(
      texture2D(inputBuffer, uv + o).r,
      texture2D(inputBuffer, uv).g,
      texture2D(inputBuffer, uv - o).b
    );
    vec2 px = uv0 * uRes;
    float g = rnd(px + fract(uTime) * 100.0);
    vec2 c = uv0 - 0.5;
    if (uWorld < 0.5) {
      float scan = 0.91 + 0.09 * sin(px.y * 3.14159 * 0.5);
      float flicker = 0.97 + 0.03 * sin(uTime * 60.0);
      col *= scan * flicker;
      col += (g - 0.5) * 0.045;
      col *= 1.0 - dot(c, c) * 1.1;
    } else {
      // fibrous paper tooth: slow anisotropic noise, multiplied in
      float fib = rnd(floor(px / vec2(3.0, 1.0)));
      col *= 0.965 + 0.035 * fib;
      col *= 1.0 - dot(c, c) * 0.22;
    }
    // outside the curved screen
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
    outputColor = vec4(col, inputColor.a);
  }
`;

export class SignalEffect extends Effect {
  constructor() {
    super("SignalEffect", fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ["uWorld", new Uniform(0)],
        ["uGlitch", new Uniform(0)],
        ["uTime", new Uniform(0)],
        ["uCA", new Uniform(0.0012)],
        ["uRes", new Uniform(new Vector2(1, 1))],
      ]),
    });
  }
  u(name: string) {
    return this.uniforms.get(name)!;
  }
}

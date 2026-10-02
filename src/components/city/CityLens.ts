import { Effect, EffectAttribute } from "postprocessing";
import { Uniform, Vector2 } from "three";

/* The city's lens.
 *  neon      → vignette, faint chromatic fringe, film grain
 *  blueprint → clean, flat print
 *  melt      → a liquid ripple that rolls out from the cursor during the world switch */
const fragment = /* glsl */ `
  uniform float uDay;
  uniform float uTime;
  uniform float uMelt;      // 0..1 progress of the ripple
  uniform vec2 uMeltAt;     // uv origin
  uniform vec2 uRes;

  float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void mainImage(const in vec4 inputColor, const in vec2 uv0, out vec4 outputColor) {
    vec2 uv = uv0;
    // liquid ripple: a travelling ring that refracts the frame
    if (uMelt > 0.0 && uMelt < 1.0) {
      vec2 d = uv - uMeltAt;
      d.x *= uRes.x / uRes.y;
      float r = length(d);
      float front = uMelt * 1.6;
      float wave = exp(-pow((r - front) * 9.0, 2.0)) * (1.0 - uMelt);
      vec2 dir = normalize(d + 1e-5);
      dir.x /= uRes.x / uRes.y;
      uv -= dir * wave * 0.06;
      // drips run down behind the front
      float drip = smoothstep(front, front - 0.25, r) * (1.0 - uMelt);
      uv.y += drip * 0.015 * (0.5 + 0.5 * sin(uv.x * 80.0));
    }
    float ca = (1.0 - uDay) * 0.0012 + (uMelt > 0.0 && uMelt < 1.0 ? 0.006 * (1.0 - uMelt) : 0.0);
    vec3 col = vec3(
      texture2D(inputBuffer, uv + vec2(ca, 0.0)).r,
      texture2D(inputBuffer, uv).g,
      texture2D(inputBuffer, uv - vec2(ca, 0.0)).b
    );
    vec2 c = uv0 - 0.5;
    if (uDay < 0.5) {
      col *= 1.0 - dot(c, c) * 0.9;
      col += (rnd(uv0 * uRes + fract(uTime) * 91.0) - 0.5) * 0.035;
    }
    outputColor = vec4(col, inputColor.a);
  }
`;

export class CityLens extends Effect {
  constructor() {
    super("CityLens", fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ["uDay", new Uniform(0)],
        ["uTime", new Uniform(0)],
        ["uMelt", new Uniform(0)],
        ["uMeltAt", new Uniform(new Vector2(0.9, 0.95))],
        ["uRes", new Uniform(new Vector2(1, 1))],
      ]),
    });
  }
  u(name: string) {
    return this.uniforms.get(name)!;
  }
}

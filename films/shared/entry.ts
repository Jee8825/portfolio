/* Browser bundle for the films: the site's real field engine, shaders, lens and content,
 * so every film draws exactly what the live site draws. */
export * as THREE from "three";
export { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
export { buildField, FORMATIONS, STAGING, CORTEX_CENTERS, TEX_W, mulberry32 } from "@/lib/formations";
export { PALETTE, hexToRgb } from "@/lib/palette";
export { pointsVert, pointsFrag, linesVert, linesFrag } from "@/components/gl/shaders";
export { SignalEffect } from "@/components/gl/SignalEffect";
export { profile, projects, skillGroups, tiers, about, seo } from "@/data/portfolio";

/* The city's tri-colour, as the WebGL layer sees it. Mirrors the CSS tokens in globals.css. */
export const PALETTE = {
  neon: {
    paper: "#0A0614",
    key: "#F1EEFF",
    t1: "#FF2E88",
    t2: "#22E1FF",
    t3: "#FFB020",
  },
  blueprint: {
    paper: "#1F4E8C",
    key: "#F4F8FF",
    t1: "#FF5C8A",
    t2: "#9FE8FF",
    t3: "#FFC94A",
  },
} as const;

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const tierHex = (world: keyof typeof PALETTE, tier: 1 | 2 | 3) =>
  PALETTE[world][`t${tier}` as "t1" | "t2" | "t3"];

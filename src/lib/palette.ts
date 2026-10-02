/* The riso trio, as the WebGL layer sees it. Mirrors the CSS tokens in globals.css. */
export const PALETTE = {
  digital: {
    paper: "#07080A",
    key: "#E8ECEF",
    t1: "#FF48B0",
    t2: "#2E8BFF",
    t3: "#FFE800",
  },
  analog: {
    paper: "#F2EDE4",
    key: "#161514",
    t1: "#FF48B0",
    t2: "#0078BF",
    t3: "#FFE800",
  },
} as const;

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS folder. The portfolio lives inside a
  // parent directory that also has lockfiles; without this, Next/Turbopack
  // may infer the wrong root. Keeps local + Vercel builds deterministic.
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingRoot: path.resolve(__dirname),
  // React <ViewTransition> morphs a project's title from its chapter into /work/[slug]
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;

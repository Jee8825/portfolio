import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded/index.css";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "./globals.css";
import { seo, profile } from "@/data/portfolio";
import { Engine } from "@/components/engine/Engine";
import Stage from "@/components/gl/Stage";
import { Hud } from "@/components/chrome/Hud";

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: profile.name }],
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.url,
    siteName: seo.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0614" },
    { media: "(prefers-color-scheme: light)", color: "#1f4e8c" },
  ],
};

/* Runs before paint: pick the world (saved choice → OS preference) so there is no flash. */
const boot = `(function(){try{var d=document.documentElement;var w=localStorage.getItem('jee:world');if(w!=='neon'&&w!=='blueprint'){w=matchMedia('(prefers-color-scheme: light)').matches?'blueprint':'neon'}d.dataset.world=w;d.dataset.quick=localStorage.getItem('jee:quick')==='1'?'1':'0'}catch(e){document.documentElement.dataset.world='neon'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-world="neon" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Engine />
        <Stage />
        <Hud />
        {children}
        <div className="atmos" aria-hidden />
        {/* liquid-melt filters used by the world switch (lib/world.ts) */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
          <filter id="melt-edge" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap id="melt-edge-map" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="melt-drip" x="-10%" y="-10%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.003 0.09" numOctaves="2" seed="8" result="n" />
            <feDisplacementMap id="melt-drip-map" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </body>
    </html>
  );
}

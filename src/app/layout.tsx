import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource-variable/recursive/full.css";
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
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
    { media: "(prefers-color-scheme: light)", color: "#f2ede4" },
  ],
};

/* Runs before paint: pick the world (saved choice → OS preference) so there is no flash. */
const boot = `(function(){try{var d=document.documentElement;var w=localStorage.getItem('jee:world');if(w!=='digital'&&w!=='analog'){w=matchMedia('(prefers-color-scheme: light)').matches?'analog':'digital'}d.dataset.world=w;d.dataset.quick=localStorage.getItem('jee:quick')==='1'?'1':'0'}catch(e){document.documentElement.dataset.world='digital'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-world="digital" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Engine />
        <Stage />
        <Hud />
        {children}
        <div className="atmos" aria-hidden />
      </body>
    </html>
  );
}

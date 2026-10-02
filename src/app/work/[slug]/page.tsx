import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, seo } from "@/data/portfolio";
import { WorkView } from "@/components/works/WorkView";

const featured = projects.filter((p) => p.featured && p.chapter);

export function generateStaticParams() {
  return featured.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = featured.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.tagline} · Jeevanandh`,
    description: p.chapter!.thesis + " " + p.description,
    alternates: { canonical: `${seo.url}/work/${p.slug}` },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = featured.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  return <WorkView slug={slug} />;
}

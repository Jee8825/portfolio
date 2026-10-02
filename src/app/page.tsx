import { Director } from "@/components/engine/Engine";
import { Boot } from "@/components/scenes/Boot";
import { Signal } from "@/components/scenes/Signal";

const STUBS = [
  ["memory", 2], ["cortex", 3], ["works", 4], ["findesk", 5], ["synapse", 6], ["cognitia", 7], ["log", 8], ["transmit", 9],
] as const;

export default function Home() {
  return (
    <>
      <Boot />
      <main id="main" className="relative z-10">
        <Signal />
        {STUBS.map(([id, f]) => (
          <section key={id} id={id} data-scene={id} data-formation={f} className="flex min-h-[180vh] items-center px-6">
            <h2 className="display text-6xl">{id}</h2>
          </section>
        ))}
      </main>
      <Director />
    </>
  );
}

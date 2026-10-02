import { Director } from "@/components/engine/Engine";
import { Boot } from "@/components/scenes/Boot";
import { Signal } from "@/components/scenes/Signal";
import { Memory } from "@/components/scenes/Memory";
import { Cortex } from "@/components/scenes/Cortex";
import { Works } from "@/components/scenes/Works";
import { Log } from "@/components/scenes/Log";
import { Transmit } from "@/components/scenes/Transmit";
import { CitySigns } from "@/components/chrome/CitySigns";

/* The film, in scroll order. Each scene's `data-formation` drives the neural field. */
export default function Home() {
  return (
    <>
      <Boot />
      <CitySigns />
      <main id="main" className="relative z-10">
        <Signal />
        <Memory />
        <Cortex />
        <Works />
        <Log />
        <Transmit />
      </main>
      <Director />
    </>
  );
}

"use client";

import type { Chapter } from "@/data/portfolio";
import { DecayDemo } from "@/components/demos/DecayDemo";
import { ApprovalDemo } from "@/components/demos/ApprovalDemo";
import { FleetDemo } from "@/components/demos/FleetDemo";
import { RagDemo } from "@/components/demos/RagDemo";

export function Demo({ kind }: { kind: Chapter["demo"] }) {
  switch (kind) {
    case "decay":
      return <DecayDemo />;
    case "approval":
      return <ApprovalDemo />;
    case "fleet":
      return <FleetDemo />;
    case "rag":
      return <RagDemo />;
  }
}

/* =====================================================================
 *  SINGLE SOURCE OF TRUTH
 *  ---------------------------------------------------------------------
 *  Every piece of content on the site lives here. The UI reads from this
 *  file, so you can restyle or fully rebuild the components without ever
 *  touching your actual content — and vice-versa.
 *
 *  The design system is built on Recall's three memory tiers:
 *    tier 1 · episodic   → pink   · mono type   · fast, flickering motion
 *    tier 2 · semantic   → blue   · text type   · settled motion
 *    tier 3 · procedural → yellow · display type · slow, heavy motion
 *  Anything with a `tier` field picks up that colour/role automatically.
 * ===================================================================== */

export type Tier = 1 | 2 | 3;

export type Social = {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "mail" | "twitter" | "huggingface";
};

/** Shapes the WebGL neural field morphs into. Order = scroll order. */
export type Formation =
  | "boot"
  | "signal"
  | "memory"
  | "cortex"
  | "rings"
  | "ledger"
  | "fleet"
  | "orb"
  | "trace"
  | "transmit";

export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  /** grid placement inside the architecture diagram (col 0-4, row 0-3) */
  col: number;
  row: number;
  tier: Tier;
};

export type Chapter = {
  /** one-line thesis shown huge at the top of the chapter */
  thesis: string;
  /** two short lines that cold-open the HyperFrames trailer */
  hook: [string, string];
  problem: string;
  insight: string;
  metrics: { value: string; label: string; note?: string }[];
  architecture: {
    nodes: ArchNode[];
    edges: [from: string, to: string, label?: string][];
  };
  /** which interactive mini-demo the chapter mounts */
  demo: "decay" | "approval" | "fleet" | "rag";
  formation: Formation;
  /** HyperFrames trailer (rendered to /public/films). Leave empty until rendered. */
  film?: { src: string; poster?: string };
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  role: string;
  status: "Live" | "Completed" | "In Progress" | "Hackathon";
  featured: boolean;
  tier: Tier;
  links?: { label: string; href: string }[];
  chapter?: Chapter;
};

export type SkillGroup = {
  title: string;
  tier: Tier;
  skills: string[];
};

export type ExperienceItem = {
  title: string;
  org: string;
  period: string;
  summary: string;
  points: string[];
  tags: string[];
};

/* --------------------------------------------------------------------- */

export const profile = {
  name: "Jeevanandh",
  firstName: "Jeevanandh",
  role: "AI & Data Science Engineer",
  degree: "B.Tech · Artificial Intelligence & Data Science",
  college: "Sri Eshwar College of Engineering",
  headline: "I build AI agents that remember, reason, and act reliably.",
  subheadline:
    "Agentic systems, LLM memory architectures, and multi-agent backends — from Bayesian confidence scoring to human-in-the-loop financial automation.",
  location: "India",
  email: "anandhjeeva88255@gmail.com",
  // Résumé (Google Drive). Swap for a /public PDF anytime if you prefer self-hosting.
  resumeUrl: "https://drive.google.com/file/d/1cB9VpU0yRXDs54NkKsfKE01yZ_iakPka/view?usp=sharing",
  // Portrait for the MEMORY scene. Drop a file in /public and point this at it.
  // While empty, a generative placeholder portrait is drawn instead.
  portrait: "",
  available: true,
  availabilityText: "Open to AI / ML engineering internships & roles",
};

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/Jee8825", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jeevanandh-b-ai-ds-605852333",
    icon: "linkedin",
  },
  { label: "Hugging Face", href: "https://huggingface.co/Jee0088", icon: "huggingface" },
  { label: "Email", href: "mailto:anandhjeeva88255@gmail.com", icon: "mail" },
];

/** The film's scenes, in scroll order. Drives the HUD, nav and the WebGL formations. */
export const scenes = [
  { id: "signal", code: "01", label: "Signal", formation: "signal" },
  { id: "memory", code: "02", label: "Memory", formation: "memory" },
  { id: "cortex", code: "03", label: "Cortex", formation: "cortex" },
  { id: "works", code: "04", label: "Works", formation: "rings" },
  { id: "log", code: "05", label: "Log", formation: "trace" },
  { id: "transmit", code: "06", label: "Transmit", formation: "transmit" },
] as const;

export const tiers = {
  1: { name: "Episodic", short: "EPI", note: "raw events · decays fast" },
  2: { name: "Semantic", short: "SEM", note: "durable facts · reinforced" },
  3: { name: "Procedural", short: "PRO", note: "learned skill · near-permanent" },
} as const;

export const about = {
  intro: "Every system I build has to answer one question: what should it remember?",
  tiers: [
    {
      tier: 1 as Tier,
      title: "What I'm chasing",
      body: "I'm a B.Tech Artificial Intelligence & Data Science student focused on the hardest part of building useful AI: making systems that actually remember, reason over their own history, and act without going off the rails.",
    },
    {
      tier: 2 as Tier,
      title: "What I know",
      body: "My work centers on agentic AI — LLM memory engines with decay and conflict resolution, multi-agent backends with deterministic guardrails, and RAG systems tuned for real users. I like problems where correctness, provenance, and trust matter as much as raw capability.",
    },
    {
      tier: 3 as Tier,
      title: "How I ship",
      body: "I ship end-to-end: schema and memory design, orchestration, APIs, and the frontend on top. I also lean heavily on AI-assisted development to move fast across many parallel projects without losing consistency.",
    },
  ],
  stats: [
    { value: "7", label: "Shipped & in-flight projects" },
    { value: "3-Tier", label: "LLM memory engine designed" },
    { value: "Multi-agent", label: "Autonomous backends built" },
    { value: "AWS · LangGraph", label: "Core AI stack" },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "AI / ML & Orchestration",
    tier: 3,
    skills: [
      "LangGraph",
      "Multi-Agent Systems",
      "RAG",
      "Mem0",
      "Guardrails AI",
      "FAISS",
      "Fine-tuning (OpenAI · Gemini · Qwen)",
      "Conformal Prediction",
      "Bayesian Confidence Scoring",
    ],
  },
  {
    title: "LLM & Cloud Platforms",
    tier: 2,
    skills: ["AWS Bedrock", "Llama 3", "Titan Embeddings", "AWS Polly", "Sarvam AI", "OpenAI", "Gemini"],
  },
  {
    title: "Backend & Frameworks",
    tier: 1,
    skills: ["Python", "FastAPI", "Flask", "Next.js", "TypeScript", "REST APIs", "n8n"],
  },
  {
    title: "Data & Infrastructure",
    tier: 2,
    skills: ["PostgreSQL", "pgvector", "Neo4j", "DynamoDB", "Redis", "Provenance Graphs", "PyTorch"],
  },
  {
    title: "AI-Assisted Development",
    tier: 1,
    skills: ["Claude Code", "Cursor", "Gemini CLI", "Codex", "Antigravity"],
  },
  {
    title: "Concepts & Focus Areas",
    tier: 3,
    skills: [
      "LLM Memory Architecture",
      "Decay & Conflict Resolution",
      "Human-in-the-loop Guardrails",
      "Agentic Reasoning",
      "Edge / Fleet Learning",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "recall",
    name: "Recall",
    tagline: "Three-Tier LLM Memory Engine",
    description:
      "An open-source memory engine that models memory as a living system — memories decay, reinforce, and self-organize instead of piling up forever. Designed and implemented end-to-end, solo.",
    highlights: [
      "Episodic → semantic → procedural tiers with strength decay S(t) = S₀·e^(−λt), boosted on every retrieval",
      "Separate confidence axis: grows with corroboration, drops on contradiction",
      "Conflict detection & resolution, plus a Neo4j provenance graph of why each belief is held",
      "Budget-aware retrieval packer: relevance × recency × strength under a token budget",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Neo4j", "Redis", "Qwen / OpenAI / Anthropic"],
    role: "Solo — architecture, schema & implementation",
    status: "Completed",
    featured: true,
    tier: 3,
    links: [{ label: "GitHub", href: "https://github.com/Jee8825/recall" }],
    chapter: {
      thesis: "The memory layer that knows how to forget.",
      hook: ["Agent memory only ever grows.", "Stale facts crowd out fresh ones."],
      problem:
        "Agent memory layers like Mem0, Zep and Letta are additive — memory accumulates forever, stale facts compete with fresh ones, and nothing tracks why a belief is held.",
      insight:
        "Give every memory two orthogonal axes: strength (decays, reinforced on retrieval) decides what surfaces; confidence (corroboration vs contradiction) decides how much to trust it.",
      metrics: [
        { value: "0.48 → 1.00", label: "precision@5", note: "with injected stale memories" },
        { value: "4 → 7", label: "relevant facts", note: "inside a 400-token budget" },
        { value: "1.33×", label: "strength retained", note: "retrieved vs untouched memories" },
      ],
      architecture: {
        nodes: [
          { id: "ingest", label: "Ingest", sub: "agent events", col: 0, row: 0, tier: 1 },
          { id: "extract", label: "Extract", sub: "heavy LLM", col: 1, row: 0, tier: 1 },
          { id: "conflict", label: "Conflict check", sub: "detect · resolve", col: 2, row: 0, tier: 2 },
          { id: "pg", label: "Postgres + pgvector", sub: "units · vectors", col: 3, row: 0, tier: 2 },
          { id: "neo", label: "Neo4j", sub: "provenance graph", col: 2, row: 1, tier: 3 },
          { id: "consolidate", label: "Consolidate", sub: "cron · promote tiers", col: 4, row: 1, tier: 3 },
          { id: "retrieve", label: "Retrieve", sub: "embed → search", col: 2, row: 2, tier: 1 },
          { id: "score", label: "Score", sub: "relevance·recency·strength", col: 3, row: 2, tier: 2 },
          { id: "pack", label: "Pack", sub: "token budget", col: 4, row: 2, tier: 3 },
        ],
        edges: [
          ["ingest", "extract"],
          ["extract", "conflict"],
          ["conflict", "pg", "persist"],
          ["conflict", "neo", "evidence"],
          ["pg", "consolidate", "decay · reinforce"],
          ["retrieve", "score"],
          ["pg", "score", "candidates"],
          ["score", "pack"],
        ],
      },
      demo: "decay",
      formation: "rings",
    },
  },
  {
    slug: "findesk",
    name: "FinDesk",
    tagline: "Autonomous CFO for Indian SMEs",
    description:
      "An autonomous finance-ops and cash-command agent that sits on top of the books a business already keeps (Tally, Zoho). It closes the books, forecasts cash and enforces payment terms — and never moves money without a human.",
    highlights: [
      "LangGraph pipeline: Planner → Executor → Critic → Approval Gate",
      "Maker-checker by construction: the agent never moves money or emails anyone unapproved",
      "Living 4/13-week cash forecasts with confidence bands; MSME Act 45-day enforcement; TReDS",
      "TDS-aware reconciliation, anomaly detection and provenance-backed books on a vendored Recall",
    ],
    stack: ["Python", "FastAPI", "LangGraph", "MCP", "PostgreSQL", "pgvector", "Neo4j", "Next.js"],
    role: "Multi-agent backend & living-memory service",
    status: "In Progress",
    featured: true,
    tier: 2,
    links: [{ label: "GitHub", href: "https://github.com/Jee8825/FinDesk" }],
    chapter: {
      thesis: "It doesn't just close your books. It defends your cash.",
      hook: ["Books close late.", "Cash crunches arrive as surprises."],
      problem:
        "Indian SMEs with 10–200 people run finance on Tally or Zoho plus spreadsheets. Reconciliation is manual, late payments go unchased, and cash crunches arrive as surprises.",
      insight:
        "Let agents do the work but make autonomy structurally safe: every action that touches money or a counterparty stops at an approval gate, with provenance for every number.",
      metrics: [
        { value: "4 agents", label: "Planner · Executor · Critic · Gate" },
        { value: "4 / 13 wk", label: "living cash forecasts", note: "with confidence bands" },
        { value: "45 days", label: "MSME Act enforcement", note: "payment-term tracking" },
      ],
      architecture: {
        nodes: [
          { id: "books", label: "Tally · Zoho · Banks", sub: "MCP tool servers", col: 0, row: 1, tier: 1 },
          { id: "planner", label: "Planner", sub: "LangGraph", col: 1, row: 0, tier: 2 },
          { id: "executor", label: "Executor", sub: "tools", col: 2, row: 0, tier: 2 },
          { id: "critic", label: "Critic", sub: "checks", col: 3, row: 0, tier: 2 },
          { id: "gate", label: "Approval Gate", sub: "human sign-off", col: 3, row: 1, tier: 3 },
          { id: "memory", label: "Recall memory", sub: "pgvector + Neo4j", col: 1, row: 2, tier: 3 },
          { id: "forecast", label: "Cash Command", sub: "forecast · TReDS · 45-day", col: 2, row: 2, tier: 1 },
          { id: "ui", label: "Dashboard", sub: "Next.js · SSE", col: 4, row: 1, tier: 1 },
        ],
        edges: [
          ["books", "planner", "ingest"],
          ["planner", "executor"],
          ["executor", "critic"],
          ["critic", "planner", "revise"],
          ["critic", "gate"],
          ["gate", "ui", "approve?"],
          ["executor", "memory"],
          ["memory", "forecast"],
          ["forecast", "gate"],
        ],
      },
      demo: "approval",
      formation: "ledger",
    },
  },
  {
    slug: "synapse",
    name: "SYNAPSE",
    tagline: "Fleet-learning intelligence at the edge",
    description:
      "A decentralized edge-AI fleet for the shop floor. Machines share compact fault signatures peer-to-peer — no raw telemetry, no central server, no cloud — so the fleet catches a diverging machine or a bad batch before parts get scrapped.",
    highlights: [
      "Four real layers per node: Isolation Forest → ADWIN drift + conformal → FAISS case memory → Zenoh P2P gossip",
      "Drift-conscience with three states: Confident (teach), Stale (listen, don't teach), Unknown (escalate)",
      "Batch-defect immunity: the same premature signature across machines = a bad lot, not wear",
      "3D fleet twin that replays real event logs — it never recomputes a decision",
    ],
    stack: ["Python", "scikit-learn", "River", "MAPIE", "FAISS", "Eclipse Zenoh", "FastAPI", "Three.js"],
    role: "Tata Technologies InnoVent — AI at the Edge",
    status: "Hackathon",
    featured: true,
    tier: 1,
    links: [
      { label: "GitHub", href: "https://github.com/Jee8825/Synapse" },
      { label: "Demo video", href: "https://drive.google.com/file/d/1nW7owNeI5d6JXrEf4zLkPTlTpM_PNDBs/view?usp=sharing" },
    ],
    chapter: {
      thesis: "One machine drifts. The whole fleet notices.",
      hook: ["Every machine is watched alone.", "So nobody sees the fleet."],
      problem:
        "Predictive maintenance watches each machine alone against a fixed threshold, so it reacts late and can't see a machine diverging from its peers or a bad tool batch hitting the whole line.",
      insight:
        "Compare machines to their identical peers instead of to a threshold — and let a node that can't trust itself stop teaching the fleet.",
      metrics: [
        { value: "< 5 ms", label: "anomaly check per window", note: "Isolation Forest, L1" },
        { value: "3 states", label: "drift-conscience", note: "confident · stale · unknown" },
        { value: "50", label: "machine fleet view", note: "same behaviours at scale" },
      ],
      architecture: {
        nodes: [
          { id: "sensor", label: "Sensors", sub: "CWRU + NASA IMS replay", col: 0, row: 1, tier: 1 },
          { id: "l1", label: "L1 · Worker", sub: "Isolation Forest", col: 1, row: 1, tier: 1 },
          { id: "l2", label: "L2 · Drift-conscience", sub: "ADWIN + conformal", col: 2, row: 1, tier: 2 },
          { id: "l3", label: "L3 · Case memory", sub: "FAISS · decay · dedup", col: 3, row: 1, tier: 3 },
          { id: "l4", label: "L4 · Gossip", sub: "Zenoh peer mode", col: 4, row: 1, tier: 2 },
          { id: "peers", label: "Peer nodes", sub: "signature-only", col: 4, row: 0, tier: 1 },
          { id: "human", label: "Human", sub: "unknown → escalate", col: 2, row: 2, tier: 3 },
        ],
        edges: [
          ["sensor", "l1"],
          ["l1", "l2"],
          ["l2", "l3", "if confident"],
          ["l3", "l4"],
          ["l4", "peers", "gossip"],
          ["peers", "l3", "born-wise"],
          ["l2", "human", "unknown"],
        ],
      },
      demo: "fleet",
      formation: "fleet",
    },
  },
  {
    slug: "cognitia-ai",
    name: "Cognitia AI",
    tagline: "AI for Bharat — AWS-native coding mentor",
    description:
      "An AWS-native AI programming mentorship platform for Tier-2/Tier-3 students in India, built for AWS's 'AI for Bharat' hackathon with Team EliteNova.",
    highlights: [
      "RAG personalization engine on AWS Bedrock (Llama 3 + Titan embeddings)",
      "Closed-loop adaptive feedback that adjusts guidance to performance",
      "Sarvam AI integration for multilingual voice — beyond English",
      "Content tailored to each learner's progress and skill level",
    ],
    stack: ["AWS Bedrock", "Llama 3", "Titan", "Sarvam AI", "AWS Polly", "DynamoDB", "n8n"],
    role: "RAG engine, adaptive feedback & multilingual voice",
    status: "Hackathon",
    featured: true,
    tier: 2,
    links: [{ label: "GitHub", href: "https://github.com/Jee8825/CognitiaAI" }],
    chapter: {
      thesis: "A mentor that speaks your language — literally.",
      hook: ["Coding help speaks English.", "Many learners think in their own language."],
      problem:
        "Students in Tier-2 and Tier-3 cities learn to code from English-only material with no one to ask, so they stall on the same concepts without feedback.",
      insight:
        "Retrieve guidance grounded in each learner's own progress, close the loop on their results, and answer in their language by voice.",
      metrics: [
        { value: "RAG", label: "Bedrock · Llama 3 · Titan" },
        { value: "Voice", label: "multilingual", note: "Sarvam AI + Polly" },
        { value: "Closed-loop", label: "adaptive feedback" },
      ],
      architecture: {
        nodes: [
          { id: "learner", label: "Learner", sub: "code · question · voice", col: 0, row: 1, tier: 1 },
          { id: "voice", label: "Sarvam AI", sub: "speech ↔ text", col: 1, row: 0, tier: 1 },
          { id: "embed", label: "Titan embeddings", sub: "query vector", col: 1, row: 1, tier: 2 },
          { id: "kb", label: "Knowledge base", sub: "curriculum · progress", col: 2, row: 2, tier: 2 },
          { id: "llm", label: "Llama 3 on Bedrock", sub: "grounded answer", col: 2, row: 1, tier: 3 },
          { id: "loop", label: "Feedback loop", sub: "performance → difficulty", col: 3, row: 2, tier: 3 },
          { id: "polly", label: "Polly", sub: "spoken reply", col: 3, row: 0, tier: 1 },
        ],
        edges: [
          ["learner", "voice"],
          ["learner", "embed"],
          ["voice", "embed"],
          ["embed", "kb", "retrieve"],
          ["kb", "llm", "context"],
          ["llm", "polly"],
          ["llm", "loop"],
          ["loop", "kb", "update"],
        ],
      },
      demo: "rag",
      formation: "orb",
    },
  },
  {
    slug: "havenwell",
    name: "HavenWell",
    tagline: "Full-stack hospital platform",
    description:
      "A MERN hospital management system with real-time updates over Socket.io: patients book appointments and contact the hospital; admins manage users, services and appointments live.",
    highlights: [
      "JWT auth, admin CRUD and a real-time dashboard",
      "Appointment lifecycle with automatic clean-up via cron",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "Socket.io"],
    role: "Full-stack",
    status: "Live",
    featured: false,
    tier: 1,
    links: [
      { label: "Live", href: "https://jeeh.netlify.app" },
      { label: "GitHub", href: "https://github.com/Jee8825/hos_web" },
    ],
  },
  {
    slug: "grammesh",
    name: "GramMesh",
    tagline: "Offline village AI mesh",
    description:
      "An offline AI mesh for connectivity-constrained regions, reusing the SYNAPSE hardware stack to bring AI to villages without reliable internet.",
    highlights: ["Offline-first mesh networking for rural connectivity", "Reuses SYNAPSE edge hardware stack"],
    stack: ["Edge AI", "Mesh Networking", "Python"],
    role: "Connectivity & edge deployment",
    status: "In Progress",
    featured: false,
    tier: 2,
  },
  {
    slug: "harvestify",
    name: "Harvestify",
    tagline: "Plant disease classifier",
    description:
      "A PyTorch-based plant disease image classifier served through a Flask API — a practical computer-vision tool for agriculture.",
    highlights: ["CNN image classifier trained in PyTorch", "Served via a lightweight Flask inference API"],
    stack: ["PyTorch", "Flask", "Computer Vision", "Python"],
    role: "Model training & serving",
    status: "Completed",
    featured: false,
    tier: 3,
  },
];

export const experience: ExperienceItem[] = [
  {
    title: "AI / ML Engineer — Independent & Hackathon Projects",
    org: "Self-directed",
    period: "Ongoing",
    summary:
      "Designing and shipping agentic AI systems end-to-end — memory engines, multi-agent backends, and RAG platforms.",
    points: [
      "Architected Recall, a three-tier LLM memory engine, solo — schema, decay, conflict resolution, and Bayesian confidence.",
      "Built FinDesk's multi-agent CFO backend with LangGraph and human-in-the-loop guardrails.",
      "Shipped a RAG-based coding mentor on AWS Bedrock for AWS's AI for Bharat hackathon.",
    ],
    tags: ["LangGraph", "AWS Bedrock", "RAG", "Multi-Agent", "LLM Memory"],
  },
];

/** 05 LOG — the memory trace. Order is the order shown; `when` is free text (no invented dates). */
export const log: { kind: string; title: string; org: string; when: string; body: string; tier: Tier; tags?: string[] }[] = [
  {
    kind: "Education",
    title: "B.Tech — Artificial Intelligence & Data Science",
    org: "Sri Eshwar College of Engineering",
    when: "Current",
    body: "Foundations in ML, statistics and data systems — applied immediately in agentic builds.",
    tier: 3,
  },
  {
    kind: "Experience",
    title: experience[0].title,
    org: experience[0].org,
    when: experience[0].period,
    body: experience[0].summary,
    tier: 2,
    tags: experience[0].tags,
  },
  {
    kind: "Build",
    title: "Recall — open-source memory engine",
    org: "Solo",
    when: "Completed",
    body: "Three-tier memory with decay, reinforcement, conflict resolution and a provenance graph.",
    tier: 3,
  },
  {
    kind: "Hackathon",
    title: "Tata Technologies InnoVent — AI at the Edge",
    org: "SYNAPSE",
    when: "Hackathon",
    body: "Serverless, signature-only fleet learning on the shop floor, with a 3D twin that replays real decisions.",
    tier: 1,
  },
  {
    kind: "Hackathon",
    title: "AWS — AI for Bharat",
    org: "Cognitia AI · Team EliteNova",
    when: "Hackathon",
    body: "RAG coding mentor on AWS Bedrock with multilingual voice for Tier-2/3 students.",
    tier: 2,
  },
  {
    kind: "Build",
    title: "FinDesk — the autonomous CFO",
    org: "Multi-agent backend",
    when: "In progress",
    body: "LangGraph agents with an approval gate, running on a vendored Recall.",
    tier: 1,
  },
];

export const seo = {
  title: "Jeevanandh — AI & Data Science Engineer",
  description:
    "B.Tech AI & DS engineer building agentic AI systems: LLM memory engines, multi-agent backends, and RAG platforms. Creator of Recall, FinDesk, SYNAPSE and Cognitia AI.",
  keywords: [
    "Jeevanandh",
    "AI Engineer",
    "Data Science",
    "LLM Memory",
    "Agentic AI",
    "LangGraph",
    "RAG",
    "Machine Learning",
  ],
  url: "https://portfolio-three-eosin-86.vercel.app",
};

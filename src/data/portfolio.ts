/* =====================================================================
 *  SINGLE SOURCE OF TRUTH
 *  ---------------------------------------------------------------------
 *  Every piece of content on the site lives here. The UI reads from this
 *  file, so you can restyle or fully rebuild the components without ever
 *  touching your actual content — and vice-versa.
 *
 *  👉 Fill in the TODO fields (socials, resume) with your real links.
 * ===================================================================== */

export type Social = {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "mail" | "twitter" | "huggingface";
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
  links?: { label: string; href: string }[];
  accent?: "violet" | "cyan" | "pink";
};

export type SkillGroup = {
  title: string;
  icon: "brain" | "workflow" | "server" | "cloud" | "database" | "terminal";
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
  // A short, punchy hero line
  headline: "I build AI agents that remember, reason, and act reliably.",
  // A slightly longer supporting line
  subheadline:
    "Agentic systems, LLM memory architectures, and multi-agent backends — from Bayesian confidence scoring to human-in-the-loop financial automation.",
  location: "India",
  email: "anandhjeeva88255@gmail.com",
  // TODO: replace with your real resume file in /public and update path, or an external link
  resumeUrl: "/resume.pdf",
  available: true,
  availabilityText: "Open to AI / ML engineering internships & roles",
};

export const socials: Social[] = [
  // TODO: replace the placeholder hrefs with your real profile URLs
  { label: "GitHub", href: "https://github.com/", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/", icon: "linkedin" },
  { label: "Hugging Face", href: "https://huggingface.co/", icon: "huggingface" },
  { label: "Email", href: "mailto:anandhjeeva88255@gmail.com", icon: "mail" },
];

export const about = {
  paragraphs: [
    "I'm a B.Tech Artificial Intelligence & Data Science student focused on the hardest part of building useful AI: making systems that actually remember, reason over their own history, and act without going off the rails.",
    "My work centers on agentic AI — LLM memory engines with decay and conflict resolution, multi-agent backends with deterministic guardrails, and RAG systems tuned for real users. I like problems where correctness, provenance, and trust matter as much as raw capability.",
    "I ship end-to-end: schema and memory design, orchestration, APIs, and the frontend on top. I also lean heavily on AI-assisted development to move fast across many parallel projects without losing consistency.",
  ],
  stats: [
    { value: "6+", label: "Shipped projects" },
    { value: "3-Tier", label: "LLM memory engine designed" },
    { value: "Multi-agent", label: "Autonomous backends built" },
    { value: "AWS · LangGraph", label: "Core AI stack" },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "AI / ML & Orchestration",
    icon: "brain",
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
    icon: "cloud",
    skills: [
      "AWS Bedrock",
      "Llama 3",
      "Titan Embeddings",
      "AWS Polly",
      "Sarvam AI",
      "OpenAI",
      "Gemini",
    ],
  },
  {
    title: "Backend & Frameworks",
    icon: "server",
    skills: ["Python", "FastAPI", "Flask", "Next.js", "TypeScript", "REST APIs", "n8n"],
  },
  {
    title: "Data & Infrastructure",
    icon: "database",
    skills: ["PostgreSQL", "pgvector", "Neo4j", "DynamoDB", "Provenance Graphs", "PyTorch"],
  },
  {
    title: "AI-Assisted Development",
    icon: "terminal",
    skills: ["Claude Code", "Cursor", "Gemini CLI", "Codex", "Antigravity"],
  },
  {
    title: "Concepts & Focus Areas",
    icon: "workflow",
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
      "A complete memory architecture for LLMs that solves context-loss in long-running agent conversations. Designed and implemented end-to-end, solo.",
    highlights: [
      "Three-tier memory with time-based decay logic",
      "Conflict detection & resolution pipeline",
      "Provenance graph tracking where every memory came from",
      "Bayesian confidence scoring over stored knowledge",
    ],
    stack: ["Python", "LLMs", "Bayesian Inference", "Graph Modeling", "Memory Schema"],
    role: "Solo — architecture, schema & implementation",
    status: "Completed",
    featured: true,
    accent: "violet",
  },
  {
    slug: "findesk",
    name: "FinDesk",
    tagline: "Autonomous CFO for Indian SMEs",
    description:
      "A multi-agent financial backend that autonomously reconciles, categorizes, and flags anomalies — with hard guardrails requiring human approval before any money moves.",
    highlights: [
      "LangGraph pipeline: Planner → Executor → Critic → Approval Gate",
      "Deterministic guardrails enforce human approval for funds movement",
      "'Living memory' with decay/confidence/conflict over pgvector + Neo4j",
      "Multi-tenant, contract-first REST APIs with append-only audit log",
      "TDS-aware reconciliation, 45-day MSME enforcement, TReDS integration",
    ],
    stack: ["Python", "FastAPI", "LangGraph", "PostgreSQL", "pgvector", "Neo4j", "Next.js"],
    role: "Multi-agent backend & living-memory service",
    status: "In Progress",
    featured: true,
    accent: "cyan",
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
    accent: "pink",
  },
  {
    slug: "synapse",
    name: "SYNAPSE",
    tagline: "Edge-AI fleet learning",
    description:
      "An edge-AI system where a fleet of nodes learns collectively. Uses conformal prediction for calibrated uncertainty so 'born-wise' nodes recognize what they haven't seen.",
    highlights: [
      "Conformal prediction for calibrated coverage guarantees",
      "Fleet-wide recognition instead of isolated per-node inference",
      "Designed for connectivity-constrained edge deployment",
    ],
    stack: ["Python", "Edge AI", "Conformal Prediction", "PyTorch"],
    role: "Hackathon project",
    status: "Hackathon",
    featured: false,
    accent: "violet",
  },
  {
    slug: "grammesh",
    name: "GramMesh",
    tagline: "Offline village AI mesh",
    description:
      "An offline AI mesh for connectivity-constrained regions, reusing the SYNAPSE hardware stack to bring AI to villages without reliable internet.",
    highlights: [
      "Offline-first mesh networking for rural connectivity",
      "Reuses SYNAPSE edge hardware stack",
    ],
    stack: ["Edge AI", "Mesh Networking", "Python"],
    role: "Connectivity & edge deployment",
    status: "In Progress",
    featured: false,
    accent: "cyan",
  },
  {
    slug: "harvestify",
    name: "Harvestify",
    tagline: "Plant disease classifier",
    description:
      "A PyTorch-based plant disease image classifier served through a Flask API — a practical computer-vision tool for agriculture.",
    highlights: [
      "CNN image classifier trained in PyTorch",
      "Served via a lightweight Flask inference API",
    ],
    stack: ["PyTorch", "Flask", "Computer Vision", "Python"],
    role: "Model training & serving",
    status: "Completed",
    featured: false,
    accent: "pink",
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

export const nav = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const seo = {
  title: "Jeevanandh — AI & Data Science Engineer",
  description:
    "B.Tech AI & DS engineer building agentic AI systems: LLM memory engines, multi-agent backends, and RAG platforms. Creator of Recall, FinDesk, and Cognitia AI.",
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
  url: "https://your-domain.vercel.app", // TODO: update after deploy
};

import type { Social } from "@/data/portfolio";

type IconProps = { className?: string };

function Github({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.556 0-.274-.01-1-.015-1.965-3.196.695-3.87-1.54-3.87-1.54-.523-1.33-1.277-1.685-1.277-1.685-1.043-.714.08-.699.08-.699 1.153.081 1.76 1.184 1.76 1.184 1.026 1.758 2.69 1.25 3.345.955.104-.743.402-1.25.73-1.538-2.552-.29-5.235-1.276-5.235-5.68 0-1.255.448-2.28 1.183-3.084-.119-.29-.513-1.46.112-3.043 0 0 .965-.309 3.16 1.178a10.98 10.98 0 0 1 2.877-.387c.976.004 1.96.132 2.878.387 2.194-1.487 3.157-1.178 3.157-1.178.627 1.583.233 2.753.114 3.043.737.804 1.182 1.829 1.182 3.084 0 4.415-2.687 5.386-5.247 5.67.413.356.78 1.057.78 2.131 0 1.539-.014 2.78-.014 3.158 0 .309.207.668.79.555A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function Linkedin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function HuggingFace({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.35 3 .97 4.3-.3.5-.47 1.09-.47 1.7a3 3 0 0 0 3 3c.4 0 .78-.08 1.13-.22A9.96 9.96 0 0 0 12 22c2.02 0 3.9-.6 5.47-1.62.32.13.68.2 1.03.2a3 3 0 0 0 3-3c0-.6-.17-1.17-.46-1.66.6-1.3.96-2.76.96-4.32 0-5.52-4.48-10-10-10zM8.5 9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm7 0a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM7.4 14.3c.28-.2.66-.13.87.14.86 1.1 2.18 1.76 3.73 1.76s2.87-.66 3.73-1.76a.62.62 0 0 1 .87-.14c.28.2.34.6.13.88-1.09 1.4-2.78 2.26-4.73 2.26s-3.64-.86-4.73-2.26a.62.62 0 0 1 .13-.88z" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function TwitterX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3L17.61 20.65z" />
    </svg>
  );
}

const map = {
  github: Github,
  linkedin: Linkedin,
  mail: MailIcon,
  twitter: TwitterX,
  huggingface: HuggingFace,
} as const;

export function SocialIcon({ icon, className }: { icon: Social["icon"]; className?: string }) {
  const Icon = map[icon] ?? MailIcon;
  return <Icon className={className ?? "h-5 w-5"} />;
}

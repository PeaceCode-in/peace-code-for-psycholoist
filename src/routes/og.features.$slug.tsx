import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { MARKETING_FEATURES } from "@/lib/marketing-features";

/**
 * Dynamic OpenGraph card generator, one per feature.
 * Route:  /og/features/{slug}.svg  →  1200×630 Sakura-themed SVG.
 *
 * SVG is accepted by Google, LinkedIn, WhatsApp, Discord, Slack, and iMessage.
 * The response is cached at the edge for a day; regenerating a card is free
 * (no image binaries in the repo, no image-gen API cost).
 */

// Sakura tokens mirrored from src/lib/sakura-tokens.ts — keep in sync.
const SAKURA = {
  cream: "#F9E6EC",
  petal: "#F5D0DC",
  blush: "#EBB6C6",
  rose: "#8A3355",
  ink: "#140A0E",
  muted: "#5B4348",
};

const xmlEscape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );

/** Wrap a long title into lines of ~24 chars, max 3 lines with ellipsis. */
function wrapTitle(text: string, maxChars = 24, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = current ? `${current} ${w}` : w;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (last.length > maxChars - 1) lines[maxLines - 1] = last.slice(0, maxChars - 1) + "…";
  }
  return lines;
}

function renderCard(name: string, desc: string): string {
  const titleLines = wrapTitle(name);
  const titleFontSize = titleLines.length >= 3 ? 74 : 88;
  const titleLineHeight = titleFontSize * 1.08;
  const titleStartY = 300 - ((titleLines.length - 1) * titleLineHeight) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${xmlEscape(name)} — PeaceCode for Psychologists">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${SAKURA.cream}"/>
      <stop offset="0.55" stop-color="${SAKURA.petal}"/>
      <stop offset="1" stop-color="${SAKURA.blush}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <symbol id="petal" viewBox="-10 -10 20 20">
      <path d="M0 -9 C 5 -6 6 0 0 9 C -6 0 -5 -6 0 -9 Z" fill="${SAKURA.rose}" opacity="0.85"/>
    </symbol>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity="0.9"/>

  <!-- petal cluster, top-right -->
  <g transform="translate(1020 130)">
    <use href="#petal" transform="translate(0 0) scale(3.2) rotate(15)"/>
    <use href="#petal" transform="translate(-70 40) scale(2.4) rotate(-30)"/>
    <use href="#petal" transform="translate(60 60) scale(2) rotate(75)"/>
    <use href="#petal" transform="translate(-40 -60) scale(1.6) rotate(120)"/>
    <use href="#petal" transform="translate(90 -30) scale(1.4) rotate(-10)"/>
  </g>

  <!-- petal cluster, bottom-left -->
  <g transform="translate(140 520)" opacity="0.85">
    <use href="#petal" transform="scale(2.6) rotate(-40)"/>
    <use href="#petal" transform="translate(70 -30) scale(1.8) rotate(20)"/>
    <use href="#petal" transform="translate(-40 -60) scale(1.4) rotate(90)"/>
  </g>

  <!-- eyebrow -->
  <text x="90" y="140" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="6" fill="${SAKURA.muted}" text-transform="uppercase">
    PEACECODE · FOR PSYCHOLOGISTS
  </text>

  <!-- title -->
  <g font-family="Georgia, 'Times New Roman', serif" fill="${SAKURA.ink}" font-weight="500">
    ${titleLines
      .map(
        (line, i) =>
          `<text x="90" y="${titleStartY + i * titleLineHeight}" font-size="${titleFontSize}" letter-spacing="-1.5">${xmlEscape(line)}</text>`,
      )
      .join("\n    ")}
  </g>

  <!-- subtitle -->
  <text x="90" y="460" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="30" fill="${SAKURA.rose}">
    ${xmlEscape(desc.length > 90 ? desc.slice(0, 87) + "…" : desc)}
  </text>

  <!-- footer -->
  <g font-family="Georgia, 'Times New Roman', serif" fill="${SAKURA.muted}">
    <text x="90" y="560" font-size="24">psychologist.peacecode.in</text>
    <text x="1110" y="560" font-size="24" text-anchor="end">Old Delhi · Global telehealth</text>
  </g>
  <line x1="90" y1="580" x2="1110" y2="580" stroke="${SAKURA.rose}" stroke-opacity="0.35" stroke-width="1"/>
</svg>`;
}

export const Route = createFileRoute("/og/features/$slug")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const feature = MARKETING_FEATURES.find((f) => f.slug === params.slug);
        if (!feature) {
          return new Response("Feature not found", { status: 404 });
        }
        const svg = renderCard(feature.name, feature.desc);
        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
          },
        });
      },
    },
  },
});

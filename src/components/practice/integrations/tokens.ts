import type { IntegrationStatus } from "@/lib/integrations-store";

// Rose + sakura tokens shared across the Integrations module.
export const ix = {
  bg: "#FDFAFA",
  paper: "#FFFFFF",
  ink: "#1E1418",
  muted: "#7B6A70",
  border: "#EADFE2",
  soft: "#F5E6EA",
  rose: "#B0567A",
  roseDeep: "#8E4560",
  sage: "#7BA184",
  sageBg: "#EAF1EC",
  amber: "#B58540",
  amberBg: "#F7EEDA",
  dust: "#B57383",
  dustBg: "#F4E3E7",
  gray: "#8A7E82",
  grayBg: "#EFE9EA",
  mono: "'DM Mono', 'JetBrains Mono', ui-monospace, monospace",
  serif: "'Fraunces', serif",
} as const;

export function statusTone(s: IntegrationStatus): { bg: string; fg: string; label: string; dot: string } {
  switch (s) {
    case "connected":  return { bg: ix.sageBg,  fg: "#4E7358",  dot: ix.sage,     label: "Connected" };
    case "degraded":   return { bg: ix.amberBg, fg: ix.amber,   dot: ix.amber,    label: "Degraded" };
    case "error":      return { bg: ix.dustBg,  fg: ix.roseDeep,dot: ix.dust,     label: "Error" };
    case "available":  return { bg: ix.grayBg,  fg: "#5D5459",  dot: ix.gray,     label: "Available" };
    case "coming-soon":return { bg: "#F1EDEE",  fg: ix.muted,   dot: "#C7BEC1",   label: "Coming soon" };
  }
}

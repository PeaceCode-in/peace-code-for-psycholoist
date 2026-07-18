import type { ComponentType } from "react";
import { SchedulingDeepDive } from "./SchedulingDeepDive";

/**
 * Canonical list of feature slugs. Kept as a `readonly` tuple so the union type
 * `FeatureSlug` is derived from the same source of truth used by the marketing
 * routes. When you add a new feature to `FEATURES` in `features.$slug.tsx`,
 * add its slug here — TypeScript will then require any deep-dive registry
 * entry to use a known slug.
 */
export const FEATURE_SLUGS = [
  "scheduling", "notes", "assessments", "telehealth", "billing", "messages",
  "homework", "groups", "patients", "safety", "referrals", "teams",
  "supervision", "cpd", "documents", "library", "analytics", "copilot",
  "compliance", "integrations", "waitlist", "profile",
] as const;

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

/**
 * Registry mapping a feature slug to a bespoke deep-dive component.
 *
 * • Keys are constrained to `FeatureSlug` — a typo won't compile.
 * • The map is `Partial` — slugs without a bespoke page fall back to the
 *   standard template in `features.$slug.tsx`.
 * • To ship a new deep-dive page: create the component, import it here,
 *   and add one line. No changes to the route file required.
 */
export const deepDiveRegistry: Partial<Record<FeatureSlug, ComponentType>> = {
  scheduling: SchedulingDeepDive,
};

/** Safe lookup — returns `undefined` for unknown slugs or slugs without a deep dive. */
export function getDeepDive(slug: string): ComponentType | undefined {
  return (deepDiveRegistry as Record<string, ComponentType | undefined>)[slug];
}

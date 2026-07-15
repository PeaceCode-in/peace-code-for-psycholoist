import { useEffect, useState } from "react";

/**
 * Returns true only after client hydration. Use to guard reads of
 * localStorage / window / document / matchMedia in render paths that also
 * run during SSR — avoids hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

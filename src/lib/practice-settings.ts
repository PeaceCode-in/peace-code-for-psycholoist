// Lightweight per-key localStorage persistence for practice settings pages.
// Each page owns its own key so we don't inflate the global Settings type.
import { useEffect, useState } from "react";

export function usePersisted<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const K = `peacecode.practice.${key}`;
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(K);
      if (raw) setV((prev) => ({ ...(prev as object), ...JSON.parse(raw) } as T));
    } catch {}
  }, [K]);
  const set = (n: T | ((p: T) => T)) =>
    setV((prev) => {
      const next = typeof n === "function" ? (n as (p: T) => T)(prev) : n;
      try { window.localStorage.setItem(K, JSON.stringify(next)); } catch {}
      return next;
    });
  return [v, set];
}

export function downloadFile(name: string, mime: string, content: string | Blob) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

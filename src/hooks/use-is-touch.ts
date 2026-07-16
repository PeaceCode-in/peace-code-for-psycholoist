import { useEffect, useState } from "react";

/**
 * Returns true on devices whose primary input has no hover (touchscreens).
 * Used to switch Recharts <Tooltip> trigger from "hover" to "click" so
 * tapping a bar/line/slice reveals the same data as a desktop hover.
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isTouch;
}

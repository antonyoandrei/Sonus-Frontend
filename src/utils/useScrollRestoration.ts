import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

/**
 * Saves scroll position when leaving a page and restores it when returning.
 * New pages scroll to top; revisited pages scroll to where the user was.
 */
export const useScrollRestoration = () => {
  const { key, pathname } = useLocation();
  const previousKey = useRef(key);

  useEffect(() => {
    /* save the previous page's scroll position */
    if (previousKey.current && previousKey.current !== key) {
      scrollPositions.set(previousKey.current, window.scrollY);
    }
    previousKey.current = key;

    /* restore or scroll to top */
    const saved = scrollPositions.get(key);
    if (saved !== undefined) {
      window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [key, pathname]);
};

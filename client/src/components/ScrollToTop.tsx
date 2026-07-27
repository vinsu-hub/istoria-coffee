import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop — resets scroll position to the top of the page on every
 * route change, so navigating to /board, /menu, /contact, etc. always
 * opens at the top instead of preserving the previous page's scroll offset.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

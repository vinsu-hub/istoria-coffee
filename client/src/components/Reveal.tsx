import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Reveal — fades and lifts its children in once they scroll into view.
 * Purely a transition wrapper — no layout opinions of its own beyond
 * what's needed for the effect.
 */
interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export default function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease-out ${delayMs}ms, transform 0.7s ease-out ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

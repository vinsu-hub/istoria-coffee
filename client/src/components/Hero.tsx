import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { frameUrls, TOTAL_FRAMES } from "@/lib/frames";

/**
 * Hero — Scroll-scrubbed cup collision animation.
 * 145 frames extracted from the owner's video (24fps, 1200x675).
 * Uses a sticky canvas that stays pinned during the scroll,
 * while the scroll position maps to frame index 0–144.
 *
 * Layout: section height = (HERO_SCROLL_VH - 1) * 100vh.
 * The canvas container is sticky at top:0, height:100vh.
 * As you scroll through the section, progress = (0 to 1)
 * maps to frame index = (0 to TOTAL_FRAMES-1).
 *
 * No loading UI is shown — only the nav fades in immediately, frames
 * preload silently in the background (and are cached by the browser
 * for subsequent visits), and the first frame auto-fades in once ready.
 */

const HERO_SCROLL_VH = 500; // total viewport heights for animation = 500vh = 5x viewport scroll
const SCROLL_SENSITIVITY = 1.02; // +2% sensitivity — reaches the last frame slightly before the nominal scroll distance
const SCROLL_GUIDE_FRAME_CUTOFF = 10; // thin scroll-down guide shows only for the first N frames
const MOTION_BLUR_PROGRESS_CUTOFF = 0.5; // motion blur only applied in the first half of the animation
const MAX_BLUR_PX = 6;
const BLUR_SETTLE_MS = 100; // how long after the last scroll tick before blur eases back to 0

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const blurSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showScrollGuide, setShowScrollGuide] = useState(true);
  const animationComplete = useRef(false);
  const scrollGuideVisibleRef = useRef(true);

  // Resize canvas to match container dimensions with DPR scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
  }, []);

  // Draw frame to canvas, optionally with a motion-blur filter
  const drawFrame = useCallback((frameIndex: number, blurPx = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageCache.current.get(frameIndex);
    if (!img || !img.complete) return;

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;

    // "object-cover" behavior: scale to fill, center-crop
    const scaleX = w / 1200;
    const scaleY = h / 675;
    const scale = Math.max(scaleX, scaleY);
    const drawW = 1200 * scale;
    const drawH = 675 * scale;
    const offsetX = (w - drawW) / 2;
    const offsetY = (h - drawH) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.filter = blurPx > 0.1 ? `blur(${blurPx}px)` : "none";
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.filter = "none";
  }, []);

  // Preload frames in background — cached by the browser for next visits
  useEffect(() => {
    let mounted = true;

    // Priority: first, middle, last frame for instant display
    const priorityFrames = [0, Math.floor(TOTAL_FRAMES / 2), TOTAL_FRAMES - 1];
    for (const idx of priorityFrames) {
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        imageCache.current.set(idx, img);
        if (idx === 0) {
          drawFrame(0);
          // Let the browser paint the drawn frame before fading it in,
          // so it eases into view instead of popping up already-visible.
          requestAnimationFrame(() => setFirstFrameReady(true));
        }
      };
      img.src = frameUrls[idx];
    }

    // Preload the rest of the sequence progressively
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (priorityFrames.includes(i)) continue;
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        imageCache.current.set(i, img);
      };
      img.src = frameUrls[i];
    }

    return () => {
      mounted = false;
    };
  }, [drawFrame]);

  // Scroll handler — maps scroll to frame index
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // The section is (HERO_SCROLL_VH - 1) * vh tall.
      // When section top = 0, progress = 0.
      // When section bottom reaches viewport bottom, progress = 1.
      const sectionHeight = rect.height;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      // +2% scroll sensitivity — completes the sequence slightly before
      // the nominal scroll distance, reducing perceived travel.
      const progress = Math.max(0, Math.min(1, (scrolled / scrollableDistance) * SCROLL_SENSITIVITY));

      const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));

      if (frameIndex !== currentFrameRef.current) {
        const now = performance.now();
        const framesDelta = Math.abs(frameIndex - currentFrameRef.current);
        const timeDelta = Math.max(1, now - (lastScrollTimeRef.current || now));
        const velocity = framesDelta / timeDelta; // frames per ms

        const applyBlur = progress < MOTION_BLUR_PROGRESS_CUTOFF;
        const blurPx = applyBlur ? Math.min(MAX_BLUR_PX, velocity * 30) : 0;

        currentFrameRef.current = frameIndex;
        lastScrollTimeRef.current = now;
        drawFrame(frameIndex, blurPx);

        if (applyBlur && blurPx > 0.1) {
          if (blurSettleTimeoutRef.current) clearTimeout(blurSettleTimeoutRef.current);
          blurSettleTimeoutRef.current = setTimeout(() => {
            drawFrame(currentFrameRef.current, 0);
          }, BLUR_SETTLE_MS);
        }
      }

      // Thin scroll-down guide — only during the first few frames
      const shouldShowGuide = frameIndex < SCROLL_GUIDE_FRAME_CUTOFF;
      if (shouldShowGuide !== scrollGuideVisibleRef.current) {
        scrollGuideVisibleRef.current = shouldShowGuide;
        setShowScrollGuide(shouldShowGuide);
      }

      // Show text overlay after animation completes (last 15% of scroll)
      if (progress > 0.92 && !animationComplete.current) {
        animationComplete.current = true;
        setShowContent(true);
      } else if (progress < 0.88) {
        animationComplete.current = false;
        setShowContent(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial draw of frame 0
    drawFrame(0);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (blurSettleTimeoutRef.current) clearTimeout(blurSettleTimeoutRef.current);
    };
  }, [drawFrame]);

  // Resize observer + initial setup
  useEffect(() => {
    resizeCanvas();
    drawFrame(currentFrameRef.current);

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      drawFrame(currentFrameRef.current);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [resizeCanvas, drawFrame]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${HERO_SCROLL_VH}vh` }}
    >
      <div
        ref={containerRef}
        className="sticky top-0 h-screen overflow-hidden bg-white"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            opacity: firstFrameReady ? 1 : 0,
            transition: "opacity 0.9s ease-out",
          }}
        />

        {/* Thin scroll-down guide — visible only for the first few frames */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            opacity: firstFrameReady && showScrollGuide ? 0.6 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <span className="font-body text-[10px] tracking-[0.25em] uppercase text-charcoal-light/70">
            Scroll
          </span>
          <span className="relative block w-px h-10 overflow-hidden bg-gradient-to-b from-charcoal-light/60 via-charcoal-light/30 to-transparent">
            <span className="absolute inset-x-0 top-0 h-2 bg-charcoal-light/80 animate-pulse" />
          </span>
        </div>

        {/* Text overlay — fades in after animation completes */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none"
          style={{
            opacity: showContent ? 1 : 0,
            transition: "opacity 0.6s ease-out",
          }}
        >
          {/* Gradient for text readability over the splash */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />

          <div className="relative z-10 container text-center">
            <p className="font-accent text-xl sm:text-2xl text-charcoal-light mb-3">
              Kape at Kwentuhan
            </p>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-charcoal leading-[1.1] mb-6">
              Where every cup
              <br />
              <span className="italic font-normal">tells a story</span>
            </h1>

            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-md mx-auto mb-8 leading-relaxed">
              Brgy. Maitim, Bay, Laguna — your neighborhood café for coffee,
              connection, and good vibes.
            </p>

            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-espresso text-warm-white px-8 py-4 rounded-full text-base font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97] pointer-events-auto"
            >
              Order now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="mt-6">
              <Link
                href="/menu"
                className="font-body text-sm text-charcoal-light hover:text-espresso transition-colors underline underline-offset-4 decoration-1 pointer-events-auto"
              >
                View our menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
